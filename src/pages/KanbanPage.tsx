import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, X, Eye, Upload } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useApp } from '../context/AppContext';
import { useLang } from '../context/LangContext';
import { REJECT_REASON_KEYS } from '../types';
import type { Application, RejectReasonTag } from '../types';

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return `${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}-${d.getFullYear()}`;
  } catch { return iso; }
}

function ApplicationCard({ application }: { application: Application }) {
  const { candidates } = useApp();
  const { t } = useLang();
  const navigate = useNavigate();
  const candidate = candidates.find(c => c.id === application.candidate_id);
  if (!candidate) return null;

  const sourceColors: Record<string, string> = {
    LinkedIn: 'bg-blue-100 text-blue-700',
    Referral: 'bg-purple-100 text-purple-700',
    Website: 'bg-zinc-100 text-zinc-600',
    Glassdoor: 'bg-green-100 text-green-700',
    Indeed: 'bg-indigo-100 text-indigo-700',
    Handshake: 'bg-orange-100 text-orange-700',
    'Campus Recruiting': 'bg-yellow-100 text-yellow-700',
    Dice: 'bg-teal-100 text-teal-700',
    Telegram: 'bg-sky-100 text-sky-700',
    ZipRecruiter: 'bg-rose-100 text-rose-700',
    Other: 'bg-gray-100 text-gray-600',
  };

  return (
    <div
      onClick={() => navigate(`/applications/${application.id}`)}
      className="bg-white rounded-lg border border-zinc-200 p-3 cursor-pointer hover:border-indigo-200 hover:shadow-sm transition-all select-none"
    >
      <p className="text-zinc-800 font-medium text-sm leading-tight mb-1">{candidate.name}</p>
      <p className="text-zinc-400 text-xs mb-2">{formatDate(application.applied_at)}</p>
      {/* Reject tag — shown on Rejected stage cards */}
      {application.rejectInfo && (
        <div className="mb-2">
          <span className="inline-block bg-red-100 text-red-700 text-xs font-semibold px-1.5 py-0.5 rounded-full">
            {t(REJECT_REASON_KEYS[application.rejectInfo.tag] as Parameters<typeof t>[0])}
          </span>
        </div>
      )}
      <div className="flex items-center justify-between">
        <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${sourceColors[candidate.source] ?? 'bg-gray-100 text-gray-600'}`}>
          {candidate.source}
        </span>
        <span className="flex items-center gap-1 text-xs text-indigo-500 font-medium pointer-events-none">
          <Eye size={12} />
          {t('jobs_view_pipeline').split(' ')[0]}
        </span>
      </div>
    </div>
  );
}

interface ColumnProps {
  stageId: string;
  stageName: string;
  stageColor: string;
  applications: Application[];
  isRejectedStage?: boolean;
  onAddClick: () => void;
}

function KanbanColumn({ stageName, stageColor, applications, isRejectedStage, onAddClick }: ColumnProps) {
  const { t } = useLang();
  const [rejectFilter, setRejectFilter] = useState<RejectReasonTag | 'all'>('all');

  const visibleApps = isRejectedStage && rejectFilter !== 'all'
    ? applications.filter(a => a.rejectInfo?.tag === rejectFilter)
    : applications;

  return (
    <div className="flex-shrink-0 w-64">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stageColor }} />
          <span className="text-zinc-700 font-medium text-sm">{stageName}</span>
          <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: stageColor }}>
            {applications.length}
          </span>
        </div>
        <button onClick={onAddClick} className="text-zinc-400 hover:text-zinc-700 transition-colors" title={t('kanban_add_candidate_title')}>
          <Plus size={16} />
        </button>
      </div>
      <div className="min-h-32 rounded-xl p-2 space-y-2 bg-zinc-100/70">
        {/* Reject reason filter — only shown for Rejected column; inside container to match card width */}
        {isRejectedStage && (
          <select
            value={rejectFilter}
            onChange={e => setRejectFilter(e.target.value as RejectReasonTag | 'all')}
            className="w-full text-xs border border-red-200 rounded-lg px-2 py-1.5 bg-white text-zinc-600 focus:outline-none focus:ring-1 focus:ring-red-300"
          >
            <option value="all">{t('reject_filter_all')}</option>
            {(Object.keys(REJECT_REASON_KEYS) as RejectReasonTag[]).map(key => (
              <option key={key} value={key}>{t(REJECT_REASON_KEYS[key] as Parameters<typeof t>[0])}</option>
            ))}
          </select>
        )}
        {visibleApps.map(app => (
          <ApplicationCard key={app.id} application={app} />
        ))}
      </div>
    </div>
  );
}

export default function KanbanPage() {
  const { id: jobId } = useParams<{ id: string }>();
  const { jobs, stages, applications, dispatch } = useApp();
  const { t } = useLang();
  const [addModal, setAddModal] = useState<{ stageId: string } | null>(null);
  const [addResumeFile, setAddResumeFile] = useState<File | null>(null);
  const [addSource, setAddSource] = useState('');
  const [addParsing, setAddParsing] = useState(false);
  const [addParsed, setAddParsed] = useState<{ name: string; email: string; phone: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const job = jobs.find(j => j.id === jobId);
  const jobApplications = applications.filter(a => a.job_id === jobId);
  const sortedStages = [...stages].sort((a, b) => a.display_order - b.display_order);
  const rejectedStageId = stages.find(s => s.name.toLowerCase() === 'rejected')?.id ?? '';

  if (!job) {
    return (
      <div className="min-h-screen bg-zinc-50">
        <Navbar />
        <div className="flex items-center justify-center h-64 text-zinc-400">{t('kanban_job_not_found')}</div>
      </div>
    );
  }

  const handleResumeChange = (file: File | null) => {
    setAddResumeFile(file);
    setAddParsed(null);
    if (!file) return;
    setAddParsing(true);
    // Mock resume parsing — simulate 1s delay then return dummy data
    setTimeout(() => {
      const mockNames = ['Alex Johnson', 'Taylor Chen', 'Sam Rivera', 'Jordan Lee', 'Casey Park'];
      const mockCompanies = ['Google', 'Amazon', 'Stripe', 'Shopify', 'Airbnb'];
      const name = mockNames[Math.floor(Math.random() * mockNames.length)];
      const company = mockCompanies[Math.floor(Math.random() * mockCompanies.length)];
      const emailLocal = name.toLowerCase().replace(' ', '.') + Math.floor(Math.random() * 900 + 100);
      setAddParsed({
        name,
        email: `${emailLocal}@${company.toLowerCase()}.com`,
        phone: `+1 ${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
      });
      setAddParsing(false);
    }, 1000);
  };

  const handleAddApplication = () => {
    if (!addModal || !addResumeFile || !addSource || !addParsed) return;
    const candidateId = `c-${Date.now()}`;
    dispatch({
      type: 'ADD_CANDIDATE',
      candidate: {
        id: candidateId,
        name: addParsed.name,
        email: addParsed.email,
        phone: addParsed.phone,
        source: addSource as 'LinkedIn' | 'Referral' | 'Website' | 'Campus Recruiting' | 'Dice' | 'Glassdoor' | 'Handshake' | 'Indeed' | 'Telegram' | 'ZipRecruiter' | 'Other',
        resume_path: addResumeFile.name,
      },
    });
    const newApp: Application = {
      id: `a-${Date.now()}`,
      job_id: jobId!,
      candidate_id: candidateId,
      stage_id: addModal.stageId,
      applied_at: new Date().toISOString().split('T')[0],
    };
    dispatch({ type: 'ADD_APPLICATION', application: newApp });
    setAddModal(null);
    setAddResumeFile(null);
    setAddSource('');
    setAddParsed(null);
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <Navbar backLink={{ to: '/jobs', label: t('jobs_title') }} title={job.title} />

      <div className="px-6 py-6 overflow-x-auto">
        <div className="flex gap-4 min-w-max pb-4">
          {sortedStages.map(stage => {
            const stageApps = jobApplications.filter(a => a.stage_id === stage.id);
            return (
              <KanbanColumn
                key={stage.id}
                stageId={stage.id}
                stageName={stage.name}
                stageColor={stage.color}
                applications={stageApps}
                isRejectedStage={stage.id === rejectedStageId}
                onAddClick={() => { setAddModal({ stageId: stage.id }); setAddResumeFile(null); setAddSource(''); setAddParsed(null); }}
              />
            );
          })}
        </div>
      </div>

      {/* Add Candidate Modal */}
      {addModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-zinc-900">{t('kanban_add_candidate')}</h2>
              <button onClick={() => { setAddModal(null); setAddResumeFile(null); setAddSource(''); setAddParsed(null); }} className="text-zinc-400 hover:text-zinc-700"><X size={20} /></button>
            </div>

            {/* Resume upload */}
            <div className="mb-4">
              <label className="text-sm font-medium text-zinc-700 block mb-1.5">{t('kanban_upload_resume')}</label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="hidden"
                onChange={e => handleResumeChange(e.target.files?.[0] ?? null)}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`w-full border-2 border-dashed rounded-xl py-5 flex flex-col items-center gap-2 transition-colors ${addResumeFile ? 'border-indigo-300 bg-indigo-50' : 'border-zinc-300 hover:border-indigo-300 hover:bg-zinc-50'}`}
              >
                <Upload size={20} className={addResumeFile ? 'text-indigo-500' : 'text-zinc-400'} />
                <span className={`text-sm font-medium ${addResumeFile ? 'text-indigo-600' : 'text-zinc-500'}`}>
                  {addResumeFile ? addResumeFile.name : t('kanban_upload_resume_hint')}
                </span>
              </button>
            </div>

            {/* Source */}
            <div className="mb-4">
              <label className="text-sm font-medium text-zinc-700 block mb-1.5">{t('kanban_select_source')}</label>
              <select
                value={addSource}
                onChange={e => setAddSource(e.target.value)}
                className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="">—</option>
                {['LinkedIn','Website','Referral','Campus Recruiting','Dice','Glassdoor','Handshake','Indeed','Telegram','ZipRecruiter','Other'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Parsing status / parsed preview */}
            {addParsing && (
              <div className="mb-4 flex items-center gap-2 text-zinc-500 text-sm">
                <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                {t('kanban_parsing')}
              </div>
            )}
            {addParsed && (
              <div className="mb-4 rounded-xl border border-indigo-200 bg-indigo-50 p-3 text-sm">
                <p className="text-xs font-semibold text-indigo-500 mb-2 uppercase tracking-wide">{t('kanban_parsed_preview')}</p>
                <p className="text-zinc-700"><span className="font-medium">Name:</span> {addParsed.name}</p>
                <p className="text-zinc-700"><span className="font-medium">Email:</span> {addParsed.email}</p>
                <p className="text-zinc-700"><span className="font-medium">Phone:</span> {addParsed.phone}</p>
              </div>
            )}

            <div className="flex gap-3 mt-2">
              <button onClick={() => { setAddModal(null); setAddResumeFile(null); setAddSource(''); setAddParsed(null); }} className="flex-1 py-2.5 rounded-lg border border-zinc-200 text-zinc-600 text-sm font-medium hover:bg-zinc-50">
                {t('kanban_cancel')}
              </button>
              <button
                onClick={handleAddApplication}
                disabled={!addResumeFile || !addSource || !addParsed}
                className="flex-1 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-sm font-medium transition-colors"
              >
                {t('kanban_submit_candidate')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
