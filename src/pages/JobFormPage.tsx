import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useApp } from '../context/AppContext';
import { useLang } from '../context/LangContext';
import type { Job, JobCommitment } from '../types';

const COMMITMENT_OPTIONS: JobCommitment[] = ['Full-time', 'Part-time', 'Contract', 'Internship'];
const LOCATION_PRESETS = ['Remote', 'Austin, TX', 'New York, NY', 'San Francisco, CA', 'Singapore', 'Beijing, China'];

interface FormState {
  title: string;
  department: string;
  team: string;
  location: string;
  commitment: JobCommitment;
  description: string;
  responsibilities: string;
  requirements: string;
  nice_to_have: string;
  about_company: string;
}

const DEFAULT_ABOUT = `InfStones is a leading blockchain infrastructure provider serving developers, exchanges, and enterprises worldwide. We operate thousands of nodes across 80+ blockchains, delivering enterprise-grade staking, API, and node services at scale.`;

const emptyForm = (): FormState => ({
  title: '',
  department: '',
  team: '',
  location: 'Remote',
  commitment: 'Full-time',
  description: '',
  responsibilities: '',
  requirements: '',
  nice_to_have: '',
  about_company: DEFAULT_ABOUT,
});

export default function JobFormPage() {
  const { t } = useLang();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const { jobs, users, currentUser, dispatch } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(emptyForm());
  const ADMIN_EMAILS = ['zhenwu@infstones.com'];
  const isAdmin = ADMIN_EMAILS.includes(currentUser?.email ?? '');
  const currentUserBase = users.find(u => u.id === currentUser?.id)?.base;
  // For Admin: let them pick base; for Member: auto-inherit their own base
  const [adminBase, setAdminBase] = useState<'US' | 'CHN'>('US');
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  useEffect(() => {
    if (isEdit) {
      const job = jobs.find(j => j.id === id);
      if (job) {
        setForm({
          title: job.title,
          department: job.department,
          team: job.team ?? '',
          location: job.location,
          commitment: job.commitment,
          description: job.description,
          responsibilities: job.responsibilities ?? '',
          requirements: job.requirements ?? '',
          nice_to_have: job.nice_to_have ?? '',
          about_company: job.about_company ?? DEFAULT_ABOUT,
        });
        if (job.base) setAdminBase(job.base);
      }
    }
  }, [id, isEdit, jobs]);

  const set = (field: keyof FormState, value: string) => {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: undefined }));
  };

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.title.trim()) e.title = 'Required';
    if (!form.department.trim()) e.department = 'Required';
    if (!form.location.trim()) e.location = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = (status?: 'open' | 'draft') => {
    if (!validate()) return;
    if (isEdit) {
      const existing = jobs.find(j => j.id === id)!;
      dispatch({
        type: 'UPDATE_JOB',
        job: {
          ...existing,
          ...form,
          team: form.team || undefined,
          responsibilities: form.responsibilities || undefined,
          requirements: form.requirements || undefined,
          nice_to_have: form.nice_to_have || undefined,
          about_company: form.about_company || undefined,
          base: isAdmin ? adminBase : (existing.base ?? currentUserBase),
          ...(status ? { status } : {}),
        },
      });
    } else {
      const newJob: Job = {
        id: `j-${Date.now()}`,
        ...form,
        team: form.team || undefined,
        responsibilities: form.responsibilities || undefined,
        requirements: form.requirements || undefined,
        nice_to_have: form.nice_to_have || undefined,
        about_company: form.about_company || undefined,
        status: status ?? 'draft',
        base: isAdmin ? adminBase : currentUserBase,
        created_at: new Date().toISOString().split('T')[0],
        created_by: currentUser?.id,
      };
      dispatch({ type: 'ADD_JOB', job: newJob });
    }
    navigate('/jobs');
  };

  const textareaClass = 'w-full border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none';
  const inputClass = (err?: string) =>
    `w-full border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 ${err ? 'border-red-300 bg-red-50' : 'border-zinc-200'}`;

  const editingJob = isEdit ? jobs.find(j => j.id === id) : null;
  const currentStatus = editingJob?.status ?? 'draft';

  return (
    <div className="min-h-screen bg-zinc-50">
      <Navbar />

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate('/jobs')} className="text-zinc-400 hover:text-zinc-700 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">{isEdit ? 'Edit Job' : 'New Job'}</h1>
            <p className="text-zinc-500 text-sm mt-0.5">Fill in the job details to create a public job listing</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* ── Basic Info ─────────────────────────────────────────── */}
          <section className="bg-white rounded-2xl border border-zinc-200 p-6">
            <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-4">{t('job_form_basic_info')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-zinc-700 block mb-1.5">{t('job_form_title_label')}</label>
                <input type="text" value={form.title} onChange={e => set('title', e.target.value)}
                  placeholder="e.g. Senior Backend Engineer"
                  className={inputClass(errors.title)} />
                {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-700 block mb-1.5">{t('job_form_department_label')}</label>
                <input type="text" value={form.department} onChange={e => set('department', e.target.value)}
                  placeholder="e.g. Engineering"
                  className={inputClass(errors.department)} />
                {errors.department && <p className="text-xs text-red-500 mt-1">{errors.department}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-700 block mb-1.5">Team</label>
                <input type="text" value={form.team} onChange={e => set('team', e.target.value)}
                  placeholder="e.g. Core Platform"
                  className={inputClass()} />
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-700 block mb-1.5">{t('job_form_location_label')}</label>
                <input list="location-options" value={form.location} onChange={e => set('location', e.target.value)}
                  placeholder="e.g. Remote"
                  className={inputClass(errors.location)} />
                <datalist id="location-options">
                  {LOCATION_PRESETS.map(l => <option key={l} value={l} />)}
                </datalist>
                {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-700 block mb-1.5">{t('job_form_commitment_label')}</label>
                <select value={form.commitment} onChange={e => set('commitment', e.target.value as JobCommitment)}
                  className={inputClass()}>
                  {COMMITMENT_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              {isAdmin && (
                <div>
                  <label className="text-sm font-medium text-zinc-700 block mb-1.5">
                    Base <span className="text-red-400">*</span>
                  </label>
                  <select value={adminBase} onChange={e => setAdminBase(e.target.value as 'US' | 'CHN')}
                    className={inputClass()}>
                    <option value="US">US</option>
                    <option value="CHN">CHN</option>
                  </select>
                  <p className="text-xs text-zinc-400 mt-1">Controls which region this job is visible to (and whether it shows on the public careers page).</p>
                </div>
              )}
            </div>
          </section>

          {/* ── Description ────────────────────────────────────────── */}
          <section className="bg-white rounded-2xl border border-zinc-200 p-6">
            <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-4">{t('job_form_about_role')}</h2>
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              rows={4} placeholder="Brief overview of the role..."
              className={textareaClass} />
          </section>

          {/* ── What you'll do ─────────────────────────────────────── */}
          <section className="bg-white rounded-2xl border border-zinc-200 p-6">
            <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-1">What You'll Do</h2>
            <p className="text-xs text-zinc-400 mb-3">Start each bullet with • (optional)</p>
            <textarea value={form.responsibilities} onChange={e => set('responsibilities', e.target.value)}
              rows={6} placeholder={'• Design and build scalable APIs\n• Collaborate with cross-functional teams\n• ...'}
              className={textareaClass} />
          </section>

          {/* ── Requirements ───────────────────────────────────────── */}
          <section className="bg-white rounded-2xl border border-zinc-200 p-6">
            <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-1">What We're Looking For</h2>
            <p className="text-xs text-zinc-400 mb-3">Start each bullet with • (optional)</p>
            <textarea value={form.requirements} onChange={e => set('requirements', e.target.value)}
              rows={6} placeholder={'• 3+ years of relevant experience\n• Proficiency in TypeScript\n• ...'}
              className={textareaClass} />
          </section>

          {/* ── Nice to have ───────────────────────────────────────── */}
          <section className="bg-white rounded-2xl border border-zinc-200 p-6">
            <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-1">Nice to Have</h2>
            <p className="text-xs text-zinc-400 mb-3">Optional — bonus qualifications or preferred experience</p>
            <textarea value={form.nice_to_have} onChange={e => set('nice_to_have', e.target.value)}
              rows={4} placeholder={'• Experience with blockchain development\n• ...'}
              className={textareaClass} />
          </section>

          {/* ── About Company ──────────────────────────────────────── */}
          <section className="bg-white rounded-2xl border border-zinc-200 p-6">
            <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-1">About InfStones</h2>
            <p className="text-xs text-zinc-400 mb-3">Company description shown at the bottom of the job post</p>
            <textarea value={form.about_company} onChange={e => set('about_company', e.target.value)}
              rows={4}
              className={textareaClass} />
          </section>

          {/* ── Actions ────────────────────────────────────────────── */}
          <div className="flex items-center justify-between pb-8">
            <button onClick={() => navigate('/jobs')}
              className="text-sm text-zinc-500 hover:text-zinc-800 transition-colors">
              Cancel
            </button>
            <div className="flex gap-3">
              {(!isEdit || currentStatus === 'draft') && (
                <button onClick={() => handleSave('draft')}
                  className="px-5 py-2.5 rounded-xl border border-zinc-200 text-zinc-600 text-sm font-medium hover:bg-zinc-50 transition-colors">
                  {t('job_form_save_draft')}
                </button>
              )}
              <button onClick={() => handleSave(isEdit ? undefined : 'draft')}
                className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors">
                {isEdit ? 'Save Changes' : 'Create Job'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
