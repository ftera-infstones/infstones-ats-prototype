import { useState } from 'react';
import { Pencil, Trash2, X, Check, UserPlus } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useApp } from '../context/AppContext';
import { useLang } from '../context/LangContext';
import type { Interviewer } from '../mock/data';

interface FormState {
  name: string;
  email: string;
  meetingRoomLink: string;
  jobIds: string[];
}

const emptyForm: FormState = { name: '', email: '', meetingRoomLink: '', jobIds: [] };

export default function InterviewersPage() {
  const { interviewers, jobs, dispatch } = useApp();
  const { t } = useLang();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (iv: Interviewer) => {
    setEditingId(iv.id);
    setForm({ name: iv.name, email: iv.email, meetingRoomLink: iv.meetingRoomLink ?? '', jobIds: [...iv.jobIds] });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim() || !form.meetingRoomLink.trim()) return;
    if (editingId) {
      dispatch({
        type: 'UPDATE_INTERVIEWER',
        interviewer: { id: editingId, name: form.name.trim(), email: form.email.trim(), meetingRoomLink: form.meetingRoomLink.trim(), jobIds: form.jobIds },
      });
    } else {
      const newInterviewer: Interviewer = {
        id: `iv-${Date.now()}`,
        name: form.name.trim(),
        email: form.email.trim(),
        meetingRoomLink: form.meetingRoomLink.trim(),
        jobIds: form.jobIds,
      };
      dispatch({ type: 'ADD_INTERVIEWER', interviewer: newInterviewer });
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    dispatch({ type: 'DELETE_INTERVIEWER', interviewerId: id });
    setDeleteConfirmId(null);
  };

  const toggleJobId = (jobId: string) => {
    setForm(prev => ({
      ...prev,
      jobIds: prev.jobIds.includes(jobId)
        ? prev.jobIds.filter(id => id !== jobId)
        : [...prev.jobIds, jobId],
    }));
  };

  const getJobTitles = (jobIds: string[]) =>
    jobIds.map(jid => jobs.find(j => j.id === jid)?.title ?? jid).join(', ');

  return (
    <div className="min-h-screen bg-zinc-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-zinc-900">Interviewers</h1>
            <p className="text-zinc-500 text-sm mt-0.5">Manage interviewers and their assigned jobs.</p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <UserPlus size={15} />
            Add Interviewer
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
          {interviewers.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-zinc-400 text-sm">
              No interviewers yet. Add one to get started.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide px-5 py-3">Name</th>
                  <th className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide px-5 py-3">Email</th>
                  <th className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide px-5 py-3">Meeting Room</th>
                  <th className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide px-5 py-3">Jobs</th>
                  <th className="text-right text-xs font-semibold text-zinc-500 uppercase tracking-wide px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {interviewers.map(iv => (
                  <tr key={iv.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-5 py-3.5 text-zinc-800 font-medium">{iv.name}</td>
                    <td className="px-5 py-3.5 text-zinc-500">{iv.email}</td>
                    <td className="px-5 py-3.5 text-zinc-500">
                      {iv.meetingRoomLink ? (
                        <a href={iv.meetingRoomLink} target="_blank" rel="noreferrer"
                          className="text-indigo-500 hover:text-indigo-700 text-xs truncate max-w-[160px] block">
                          {iv.meetingRoomLink.replace('https://', '')}
                        </a>
                      ) : <span className="text-zinc-300">—</span>}
                    </td>
                    <td className="px-5 py-3.5 text-zinc-600">
                      {iv.jobIds.length === 0
                        ? <span className="text-zinc-400">—</span>
                        : getJobTitles(iv.jobIds)
                      }
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        {deleteConfirmId === iv.id ? (
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-zinc-500">Delete?</span>
                            <button
                              onClick={() => handleDelete(iv.id)}
                              className="flex items-center gap-1 text-red-600 hover:text-red-700 font-medium"
                            >
                              <Check size={13} /> Yes
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="flex items-center gap-1 text-zinc-500 hover:text-zinc-700"
                            >
                              <X size={13} /> No
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => openEdit(iv)}
                              className="flex items-center gap-1.5 text-zinc-500 hover:text-indigo-600 transition-colors text-xs font-medium px-2 py-1 rounded hover:bg-indigo-50"
                            >
                              <Pencil size={12} /> Edit
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(iv.id)}
                              className="flex items-center gap-1.5 text-zinc-500 hover:text-red-600 transition-colors text-xs font-medium px-2 py-1 rounded hover:bg-red-50"
                            >
                              <Trash2 size={12} /> Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />

          {/* Dialog */}
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-zinc-900">
                {editingId ? 'Edit Interviewer' : 'Add Interviewer'}
              </h2>
              <button onClick={closeModal} className="text-zinc-400 hover:text-zinc-600">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1.5">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={t('interviewers_form_name_placeholder')}
                  className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1.5">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder={t('interviewers_form_email_placeholder')}
                  className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              {/* Meeting Room Link */}
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1.5">Meeting Room Link *</label>
                <input
                  type="url"
                  value={form.meetingRoomLink}
                  onChange={e => setForm(prev => ({ ...prev, meetingRoomLink: e.target.value }))}
                  placeholder={t('interviewers_form_meeting_placeholder')}
                  className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              {/* Jobs Multi-select */}
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1.5">Assigned Jobs</label>
                <div className="border border-zinc-200 rounded-lg divide-y divide-zinc-100 max-h-48 overflow-y-auto">
                  {jobs.map(job => (
                    <label
                      key={job.id}
                      className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-zinc-50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={form.jobIds.includes(job.id)}
                        onChange={() => toggleJobId(job.id)}
                        className="accent-indigo-500"
                      />
                      <div>
                        <span className="text-sm text-zinc-800">{job.title}</span>
                        <span className="text-xs text-zinc-400 ml-2">{job.department}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm text-zinc-600 hover:text-zinc-800 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!form.name.trim() || !form.email.trim() || !form.meetingRoomLink.trim()}
                className="px-4 py-2 text-sm font-medium bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                {editingId ? 'Save Changes' : 'Add Interviewer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
