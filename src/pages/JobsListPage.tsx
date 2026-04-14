import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Briefcase, Users, ChevronRight, ChevronDown } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useApp } from '../context/AppContext';
import { useLang } from '../context/LangContext';
import type { Job } from '../types';

type FilterTab = 'all' | 'open' | 'draft' | 'closed';

const statusColors: Record<Job['status'], string> = {
  open: 'bg-green-100 text-green-700 hover:bg-green-200',
  draft: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
  closed: 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200',
};

function StatusDropdown({ job, onOpen, onClose, onReopen, onDelete }: {
  job: Job;
  onOpen: () => void;
  onClose: () => void;
  onReopen: () => void;
  onDelete: () => void;
}) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const statusLabel =
    job.status === 'open' ? t('jobs_status_open') :
    job.status === 'draft' ? t('jobs_status_draft') :
    t('jobs_status_closed');

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full transition-colors cursor-pointer ${statusColors[job.status]}`}
      >
        {statusLabel}
        <ChevronDown size={11} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white rounded-xl border border-zinc-200 shadow-lg z-20 min-w-[140px] py-1 overflow-hidden">
          {job.status === 'draft' && (
            <>
              <button
                onClick={() => { onOpen(); setOpen(false); }}
                className="w-full text-left px-3 py-2 text-xs font-medium text-green-700 hover:bg-green-50 transition-colors"
              >
                {t('jobs_action_open')}
              </button>
              <button
                onClick={() => { onDelete(); setOpen(false); }}
                className="w-full text-left px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                {t('jobs_action_delete')}
              </button>
            </>
          )}
          {job.status === 'open' && (
            <button
              onClick={() => { onClose(); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
            >
              {t('jobs_action_close')}
            </button>
          )}
          {job.status === 'closed' && (
            <button
              onClick={() => { onReopen(); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-xs font-medium text-green-700 hover:bg-green-50 transition-colors"
            >
              {t('jobs_action_reopen')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

const ADMIN_EMAILS = ['zhenwu@infstones.com'];

export default function JobsListPage() {
  const { jobs, applications, currentUser, users, dispatch } = useApp();
  const { t } = useLang();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterTab>('all');

  // Role-based filtering: Members only see their own jobs
  const currentUserBase = users.find(u => u.id === currentUser?.id)?.base;
  const visibleJobs = ADMIN_EMAILS.includes(currentUser?.email ?? '')
    ? jobs
    : jobs.filter(j => {
        if (!j.created_by) return true;
        const creator = users.find(u => u.id === j.created_by);
        // If current user has a location, show jobs from same-location creators
        if (currentUserBase) return creator?.base === currentUserBase;
        // Fallback: own jobs only
        return j.created_by === currentUser?.id;
      });

  const filtered = filter === 'all' ? visibleJobs : visibleJobs.filter(j => j.status === filter);

  const candidateCount = (jobId: string) =>
    applications.filter(a => a.job_id === jobId).length;

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: t('jobs_filter_all') },
    { key: 'open', label: t('jobs_filter_open') },
    { key: 'draft', label: t('jobs_filter_draft') },
    { key: 'closed', label: t('jobs_filter_closed') },
  ];

  const openCount = visibleJobs.filter(j => j.status === 'open').length;

  return (
    <div className="min-h-screen bg-zinc-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">{t('jobs_title')}</h1>
            <p className="text-zinc-500 text-sm mt-1">
              {openCount} {openCount === 1 ? t('jobs_open_job') : t('jobs_open_jobs')}
            </p>
          </div>
          <Link
            to="/jobs/new"
            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={16} />
            {t('jobs_new_job')}
          </Link>
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
          {filtered.map(job => {
            const count = candidateCount(job.id);
            return (
              <div
                key={job.id}
                className="bg-white rounded-xl border border-zinc-200 p-5 hover:border-zinc-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <Briefcase size={18} className="text-indigo-500" />
                  </div>
                  <StatusDropdown
                    job={job}
                    onOpen={() => dispatch({ type: 'UPDATE_JOB_STATUS', payload: { jobId: job.id, status: 'open' } })}
                    onClose={() => dispatch({ type: 'UPDATE_JOB_STATUS', payload: { jobId: job.id, status: 'closed' } })}
                    onReopen={() => dispatch({ type: 'UPDATE_JOB_STATUS', payload: { jobId: job.id, status: 'open' } })}
                    onDelete={() => {
                      if (window.confirm(t('jobs_action_delete_confirm')))
                        dispatch({ type: 'DELETE_JOB', payload: { jobId: job.id } });
                    }}
                  />
                </div>

                <h3 className="text-zinc-900 font-semibold mb-1">{job.title}</h3>
                <p className="text-zinc-400 text-xs mb-1">{job.department}</p>

                <div className="flex items-center gap-1.5 text-zinc-500 text-sm mb-4">
                  <Users size={14} />
                  <span>{count} {count === 1 ? t('jobs_candidate') : t('jobs_candidates')}</span>
                </div>

                {/* Direct buttons */}
                <div className="flex gap-2">
                  {job.status !== 'draft' && (
                    <button
                      onClick={() => navigate(`/jobs/${job.id}/kanban`)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-zinc-50 hover:bg-indigo-50 hover:text-indigo-600 text-zinc-600 text-sm font-medium py-2 rounded-lg transition-colors border border-zinc-200 hover:border-indigo-200"
                    >
                      {t('jobs_view_pipeline')}
                      <ChevronRight size={14} />
                    </button>
                  )}
                  {(job.status === 'draft' || job.status === 'open') && (
                    <Link
                      to={`/jobs/${job.id}/edit`}
                      className={`${job.status === 'draft' ? 'flex-1' : 'px-3'} flex items-center justify-center gap-1.5 bg-zinc-50 hover:bg-zinc-100 text-zinc-600 text-sm font-medium py-2 rounded-lg transition-colors border border-zinc-200`}
                    >
                      {t('jobs_edit')}
                    </Link>
                  )}
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="col-span-3 text-center py-16 text-zinc-400">
              {t('jobs_no_jobs')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
