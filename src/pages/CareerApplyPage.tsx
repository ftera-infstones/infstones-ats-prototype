import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import logoSrc from '../assets/logo.png';
import { useApp } from '../context/AppContext';
import { useLang } from '../context/LangContext';
import { ArrowLeft, Upload } from 'lucide-react';

type ApplicantSource = 'LinkedIn' | 'Referral' | 'Website' | 'Campus Recruiting' | 'Dice' | 'Glassdoor' | 'Handshake' | 'Indeed' | 'Telegram' | 'ZipRecruiter' | 'Other' | '';

interface ApplyForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  currentCompany: string;
  currentTitle: string;
  linkedIn: string;
  portfolio: string;
  resumeFileName: string;
  source: ApplicantSource;
  referrerName: string;
}

export default function CareerApplyPage() {
  const { t } = useLang();
  const { id } = useParams<{ id: string }>();
  const { jobs } = useApp();
  const job = jobs.find(j => j.id === id);

  const [form, setForm] = useState<ApplyForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    currentCompany: '',
    currentTitle: '',
    linkedIn: '',
    portfolio: '',
    resumeFileName: '',
    source: '',
    referrerName: '',
  });
  const [submitted, setSubmitted] = useState(false);

  if (!job || job.status !== 'open') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">Position Unavailable</h2>
          <p className="text-zinc-500 mb-6">This position is no longer accepting applications.</p>
          <Link to="/careers" className="text-indigo-500 hover:text-indigo-700 text-sm font-medium">← View all open roles</Link>
        </div>
      </div>
    );
  }

  const set = (field: keyof ApplyForm, value: string) =>
    setForm(f => ({ ...f, [field]: value }));

  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">Application Submitted!</h2>
          <p className="text-zinc-500 mb-2">Thank you for applying to <strong>{job.title}</strong> at InfStones.</p>
          <p className="text-zinc-400 text-sm mb-8">Our team will review your application and be in touch.</p>
          <Link to="/careers" className="text-indigo-500 hover:text-indigo-700 text-sm font-medium">← View all open roles</Link>
        </div>
      </div>
    );
  }

  const inputClass = 'w-full border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400';

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-zinc-100 sticky top-0 bg-white z-30">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link to={`/careers/${job.id}`} className="text-zinc-400 hover:text-zinc-700 flex items-center gap-1.5 text-sm">
            <ArrowLeft size={15} />
            Job Details
          </Link>
          <span className="text-zinc-200">|</span>
          <img src={logoSrc} alt="InfStones" className="w-7 h-7 rounded-lg object-cover" />
          <span className="font-semibold text-zinc-800 text-sm">InfStones</span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Title */}
        <div className="mb-8">
          <p className="text-indigo-500 text-sm font-medium mb-1">Apply for</p>
          <h1 className="text-2xl font-bold text-zinc-900">{job.title}</h1>
          <p className="text-zinc-400 text-sm mt-1">{job.department} · {job.location} · {job.commitment}</p>
        </div>

        <div className="space-y-6">
          {/* Personal Info */}
          <section className="bg-zinc-50 rounded-2xl border border-zinc-200 p-6">
            <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-zinc-700 block mb-1.5">{t('apply_first_name')}</label>
                <input type="text" value={form.firstName} onChange={e => set('firstName', e.target.value)}
                  placeholder="Jane" className={inputClass} />
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-700 block mb-1.5">{t('apply_last_name')}</label>
                <input type="text" value={form.lastName} onChange={e => set('lastName', e.target.value)}
                  placeholder="Smith" className={inputClass} />
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-700 block mb-1.5">Email *</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                  placeholder="jane@example.com" className={inputClass} />
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-700 block mb-1.5">Phone</label>
                <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                  placeholder="+1 (555) 000-0000" className={inputClass} />
              </div>
            </div>
          </section>

          {/* Current Role */}
          <section className="bg-zinc-50 rounded-2xl border border-zinc-200 p-6">
            <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-4">{t('apply_current_role')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-zinc-700 block mb-1.5">Current Company</label>
                <input type="text" value={form.currentCompany} onChange={e => set('currentCompany', e.target.value)}
                  placeholder="Acme Inc." className={inputClass} />
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-700 block mb-1.5">Current Title</label>
                <input type="text" value={form.currentTitle} onChange={e => set('currentTitle', e.target.value)}
                  placeholder="Software Engineer" className={inputClass} />
              </div>
            </div>
          </section>

          {/* Links */}
          <section className="bg-zinc-50 rounded-2xl border border-zinc-200 p-6">
            <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-4">Links</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-zinc-700 block mb-1.5">LinkedIn Profile</label>
                <input type="url" value={form.linkedIn} onChange={e => set('linkedIn', e.target.value)}
                  placeholder="https://linkedin.com/in/..." className={inputClass} />
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-700 block mb-1.5">Portfolio / GitHub / Website</label>
                <input type="url" value={form.portfolio} onChange={e => set('portfolio', e.target.value)}
                  placeholder="https://github.com/..." className={inputClass} />
              </div>
            </div>
          </section>

          {/* Resume */}
          <section className="bg-zinc-50 rounded-2xl border border-zinc-200 p-6">
            <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-4">Resume / CV</h2>
            <div
              className="border-2 border-dashed border-zinc-300 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
              onClick={() => {
                // Prototype: simulate file selection
                set('resumeFileName', 'Resume.pdf');
              }}
            >
              <Upload size={24} className="text-zinc-400 mx-auto mb-2" />
              {form.resumeFileName ? (
                <p className="text-indigo-600 text-sm font-medium">{form.resumeFileName}</p>
              ) : (
                <>
                  <p className="text-zinc-600 text-sm font-medium">Click to upload your resume</p>
                  <p className="text-zinc-400 text-xs mt-1">PDF or DOCX · Max 10MB</p>
                </>
              )}
            </div>
          </section>

          {/* APPLICANT SOURCE */}
          <section className="bg-zinc-50 rounded-2xl border border-zinc-200 p-6">
            <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-4">{t('apply_source_section')}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  Where did you find our job posting? <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.source}
                  onChange={e => set('source', e.target.value as ApplicantSource)}
                  className="w-full border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                >
                  <option value="">Please choose where you found our job posting:</option>
                  <option value="Website">InfStones Website &amp; Marketing</option>
                  <option value="Campus Recruiting">Campus Recruiting</option>
                  <option value="Dice">Dice</option>
                  <option value="Glassdoor">Glassdoor</option>
                  <option value="Handshake">Handshake</option>
                  <option value="Indeed">Indeed</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Referral">InfStones Team Member Referral (name required)</option>
                  <option value="Telegram">Telegram</option>
                  <option value="ZipRecruiter">ZipRecruiter</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              {form.source === 'Referral' && (
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                    Referrer Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.referrerName}
                    onChange={e => set('referrerName', e.target.value)}
                    placeholder="Full name of the InfStones team member who referred you"
                    className="w-full border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
              )}
            </div>
          </section>

          {/* Submit */}
          <div className="flex items-center justify-between pb-8">
            <Link to={`/careers/${job.id}`} className="text-sm text-zinc-500 hover:text-zinc-800 transition-colors">
              Cancel
            </Link>
            <button
              onClick={() => {
                if (!form.firstName.trim() || !form.email.trim()) {
                  alert('Please fill in First Name and Email.');
                  return;
                }
                if (!form.source) {
                  alert('Please select where you found our job posting.');
                  return;
                }
                if (form.source === 'Referral' && !form.referrerName.trim()) {
                  alert('Please enter the name of the team member who referred you.');
                  return;
                }
                setSubmitted(true);
              }}
              className="px-8 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold transition-colors"
            >
              {t('apply_submit_btn')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
