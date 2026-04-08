import { useState } from 'react';
import { Link } from 'react-router-dom';
import logoSrc from '../assets/logo.png';
import { useApp } from '../context/AppContext';
import { useLang } from '../context/LangContext';
import { MapPin, Clock, Code2 } from 'lucide-react';

export default function CareersPage() {
  const { t } = useLang();
  const { jobs, users } = useApp();
  const [showApi, setShowApi] = useState(false);

  // Only show open jobs created by US-location members (for official website display)
  const openJobs = jobs.filter(j => {
    if (j.status !== 'open') return false;
    if (!j.created_by) return true; // admin-created jobs show by default
    const creator = users.find(u => u.id === j.created_by);
    return !creator?.base || creator.base === 'US';
  });

  // Group by department
  const byDept: Record<string, typeof openJobs> = {};
  for (const job of openJobs) {
    if (!byDept[job.department]) byDept[job.department] = [];
    byDept[job.department].push(job);
  }

  // API JSON payload
  const apiPayload = {
    jobs: openJobs.map(j => ({
      id: j.id,
      title: j.title,
      department: j.department,
      team: j.team ?? null,
      location: j.location,
      commitment: j.commitment,
      description: j.description,
      detail_url: `${window.location.origin}${window.location.pathname.split('#')[0]}#/careers/${j.id}`,
      apply_url: `${window.location.origin}${window.location.pathname.split('#')[0]}#/careers/${j.id}/apply`,
    })),
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-zinc-100">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoSrc} alt="InfStones" className="w-8 h-8 rounded-lg object-cover" />
            <div>
              <span className="font-bold text-zinc-900 text-lg">InfStones</span>
              <span className="text-zinc-400 text-sm ml-2">Careers</span>
            </div>
          </div>
          <button
            onClick={() => setShowApi(s => !s)}
            className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-indigo-600 border border-zinc-200 hover:border-indigo-300 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Code2 size={14} />
            API
          </button>
        </div>
      </header>

      {/* API panel */}
      {showApi && (
        <div className="bg-zinc-900 border-b border-zinc-700">
          <div className="max-w-5xl mx-auto px-6 py-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-zinc-300 text-sm font-semibold">Website Integration API</p>
                <p className="text-zinc-500 text-xs mt-0.5">Fetch this data to display open roles on your website. In production, this would be a REST endpoint.</p>
              </div>
              <button onClick={() => setShowApi(false)} className="text-zinc-500 hover:text-zinc-300 text-xs">Close</button>
            </div>
            <pre className="text-xs text-green-400 overflow-x-auto bg-black/40 rounded-xl p-4 max-h-80 overflow-y-auto">
              {JSON.stringify(apiPayload, null, 2)}
            </pre>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-zinc-900 mb-3">{t('careers_hero_title')}</h1>
          <p className="text-zinc-500 max-w-xl mx-auto">
            We're building the infrastructure layer for the decentralized internet. Come work on hard problems with a world-class team.
          </p>
          <div className="mt-4 text-sm text-indigo-600 font-medium">{openJobs.length} open position{openJobs.length !== 1 ? 's' : ''}</div>
        </div>

        {openJobs.length === 0 ? (
          <div className="text-center py-16 text-zinc-400">No open positions at the moment. Check back soon!</div>
        ) : (
          <div className="space-y-12">
            {Object.entries(byDept).map(([dept, deptJobs]) => (
              <section key={dept}>
                <h2 className="text-xl font-bold text-zinc-900 mb-2">{dept.toUpperCase()}</h2>
                <div className="w-8 h-0.5 bg-yellow-400 mb-6" />
                <div className="divide-y divide-zinc-100">
                  {deptJobs.map(job => (
                    <div key={job.id} className="flex items-center justify-between py-5 group">
                      <div className="flex-1">
                        <h3 className="text-zinc-900 font-medium group-hover:text-indigo-600 transition-colors">
                          <Link to={`/careers/${job.id}`}>{job.title}</Link>
                        </h3>
                        <div className="flex items-center gap-3 mt-1 text-zinc-400 text-sm">
                          <span className="flex items-center gap-1"><MapPin size={12} />{job.location}</span>
                          <span className="text-zinc-200">|</span>
                          <span className="flex items-center gap-1"><Clock size={12} />{job.commitment}</span>
                        </div>
                      </div>
                      <Link
                        to={`/careers/${job.id}/apply`}
                        className="ml-6 flex-shrink-0 bg-yellow-400 hover:bg-yellow-300 text-zinc-900 text-xs font-bold px-5 py-2.5 rounded-full transition-colors uppercase tracking-wide"
                      >
                        Apply Now
                      </Link>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
