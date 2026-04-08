import { useParams, Link } from 'react-router-dom';
import logoSrc from '../assets/logo.png';
import { useApp } from '../context/AppContext';
import { useLang } from '../context/LangContext';
import { MapPin, Clock, Building2, ArrowLeft } from 'lucide-react';

function renderBullets(text: string) {
  if (!text.trim()) return null;
  const lines = text.split('\n').filter(l => l.trim());
  return (
    <ul className="space-y-2">
      {lines.map((line, i) => (
        <li key={i} className="flex items-start gap-2 text-zinc-700 text-sm leading-relaxed">
          <span className="text-indigo-400 mt-0.5 flex-shrink-0">•</span>
          <span>{line.replace(/^[•\-]\s*/, '')}</span>
        </li>
      ))}
    </ul>
  );
}

export default function CareerJobDetailPage() {
  const { t } = useLang();
  const { id } = useParams<{ id: string }>();
  const { jobs } = useApp();
  const job = jobs.find(j => j.id === id);

  if (!job || job.status !== 'open') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">Job Not Found</h2>
          <p className="text-zinc-500 mb-6">This position is no longer available.</p>
          <Link to="/careers" className="text-indigo-500 hover:text-indigo-700 text-sm font-medium">← View all open roles</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-zinc-100 sticky top-0 bg-white z-30">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/careers" className="text-zinc-400 hover:text-zinc-700 flex items-center gap-1.5 text-sm">
              <ArrowLeft size={15} />
              {t('career_detail_all_jobs')}
            </Link>
            <span className="text-zinc-200">|</span>
            <img src={logoSrc} alt="InfStones" className="w-7 h-7 rounded-lg object-cover" />
            <span className="font-semibold text-zinc-800 text-sm">InfStones</span>
          </div>
          <Link
            to={`/careers/${job.id}/apply`}
            className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
          >
            Apply Now
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Job title + meta */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-zinc-900 mb-4">{job.title}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-zinc-500">
            <span className="flex items-center gap-1.5">
              <Building2 size={15} className="text-zinc-400" />
              {job.department}{job.team ? ` · ${job.team}` : ''}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin size={15} className="text-zinc-400" />
              {job.location}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={15} className="text-zinc-400" />
              {job.commitment}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {job.description && (
              <section>
                <h2 className="text-lg font-semibold text-zinc-900 mb-3">{t('career_detail_about_role')}</h2>
                <p className="text-zinc-700 text-sm leading-relaxed">{job.description}</p>
              </section>
            )}

            {job.responsibilities && (
              <section>
                <h2 className="text-lg font-semibold text-zinc-900 mb-3">What You'll Do</h2>
                {renderBullets(job.responsibilities)}
              </section>
            )}

            {job.requirements && (
              <section>
                <h2 className="text-lg font-semibold text-zinc-900 mb-3">What We're Looking For</h2>
                {renderBullets(job.requirements)}
              </section>
            )}

            {job.nice_to_have && (
              <section>
                <h2 className="text-lg font-semibold text-zinc-900 mb-3">Nice to Have</h2>
                {renderBullets(job.nice_to_have)}
              </section>
            )}

            {job.about_company && (
              <section className="border-t border-zinc-100 pt-8">
                <h2 className="text-lg font-semibold text-zinc-900 mb-3">About InfStones</h2>
                <p className="text-zinc-700 text-sm leading-relaxed">{job.about_company}</p>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <div className="bg-zinc-50 rounded-2xl border border-zinc-200 p-5 sticky top-24">
              <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-4">Job Details</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-xs text-zinc-400 mb-0.5">Department</dt>
                  <dd className="text-sm font-medium text-zinc-800">{job.department}</dd>
                </div>
                {job.team && (
                  <div>
                    <dt className="text-xs text-zinc-400 mb-0.5">Team</dt>
                    <dd className="text-sm font-medium text-zinc-800">{job.team}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-xs text-zinc-400 mb-0.5">Location</dt>
                  <dd className="text-sm font-medium text-zinc-800">{job.location}</dd>
                </div>
                <div>
                  <dt className="text-xs text-zinc-400 mb-0.5">Commitment</dt>
                  <dd className="text-sm font-medium text-zinc-800">{job.commitment}</dd>
                </div>
              </dl>
              <Link
                to={`/careers/${job.id}/apply`}
                className="mt-6 w-full flex items-center justify-center bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold py-3 rounded-xl transition-colors"
              >
                Apply for this Role
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
