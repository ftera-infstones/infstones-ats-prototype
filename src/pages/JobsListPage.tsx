import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Briefcase, Users, ChevronRight, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useApp } from '../context/AppContext';
import type { Job } from '../mock/data';

type FilterTab = 'all' | 'open' | 'draft' | 'closed';

const statusColors: Record<Job['status'], string> = {
  open: 'bg-green-100 text-green-700',
  draft: 'bg-yellow-100 text-yellow-700',
  closed: 'bg-zinc-100 text-zinc-500',
};

export default function JobsListPage() {
  const { jobs, applications, dispatch } = useApp();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterTab>('all');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', department: '', description: '' });

  const filtered = filter === 'all' ? jobs : jobs.filter(j => j.status === filter);

  const candidateCount = (jobId: string) =>
    applications.filter(a => a.job_id === jobId).length;

  const handleAddJob = () => {
    if (!form.title.trim() || !form.department.trim()) return;
    const newJob: Job = {
      id: `j-${Date.now()}`,
      title: form.title,
      department: form.department,
      description: form.description,
      status: 'open',
      created_at: new Date().toISOString().split('T')[0],
    };
    dispatch({ type: 'ADD_JOB', job: newJob });
    setForm({ title: '', department: '', description: '' });
    setShowModal(false);
  };

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'open', label: 'Open' },
    { key: 'draft', label: 'Draft' },
    { key: 'closed', label: 'Closed' },
  ];

  return (
    <div className="min-h-screen bg-zinc-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Open Positions</h1>
            <p className="text-zinc-500 text-sm mt-1">{jobs.filter(j => j.status === 'open').length} active roles</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={16} />
            New Job
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 mb-6 border-b border-zinc-200">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                filter === tab.key
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Job Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(job => (
            <div
              key={job.id}
              className="bg-white rounded-xl border border-zinc-200 p-5 hover:border-indigo-200 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <Briefcase size={18} className="text-indigo-500" />
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[job.status]}`}>
                  {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                </span>
              </div>

              <h3 className="text-zinc-900 font-semibold mb-1">{job.title}</h3>
              <p className="text-zinc-400 text-xs mb-3">{job.department}</p>

              <div className="flex items-center gap-1.5 text-zinc-500 text-sm mb-4">
                <Users size={14} />
                <span>{candidateCount(job.id)} candidates</span>
              </div>

              <button
                onClick={() => navigate(`/jobs/${job.id}/kanban`)}
                className="w-full flex items-center justify-center gap-1.5 bg-zinc-50 hover:bg-indigo-50 hover:text-indigo-600 text-zinc-600 text-sm font-medium py-2 rounded-lg transition-colors border border-zinc-200 hover:border-indigo-200"
              >
                View Pipeline
                <ChevronRight size={14} />
              </button>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-3 text-center py-16 text-zinc-400">
              No jobs found for this filter.
            </div>
          )}
        </div>
      </div>

      {/* New Job Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-zinc-900">New Job</h2>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-zinc-700">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-zinc-700 block mb-1.5">Job Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Senior Backend Engineer"
                  className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-700 block mb-1.5">Department *</label>
                <input
                  type="text"
                  value={form.department}
                  onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                  placeholder="e.g. Engineering"
                  className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-700 block mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Describe the role..."
                  rows={4}
                  className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-lg border border-zinc-200 text-zinc-600 text-sm font-medium hover:bg-zinc-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddJob}
                disabled={!form.title.trim() || !form.department.trim()}
                className="flex-1 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
              >
                Save Job
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
