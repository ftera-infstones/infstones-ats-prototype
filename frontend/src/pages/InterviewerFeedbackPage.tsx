import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Paperclip, FileText, X, Star } from 'lucide-react';
import logoSrc from '../assets/logo.png';
import { useApp } from '../context/AppContext';
import type { FeedbackFormQuestion } from '../mock/data';
import { useLang } from '../context/LangContext';

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${mm}-${dd}-${yyyy}`;
  } catch { return iso; }
}

export default function InterviewerFeedbackPage() {
  const { applicationId, stageId } = useParams<{ applicationId: string; stageId: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const { applications, candidates, jobs, stages, interviewers, interviewQuestions, feedbackForms, dispatch } = useApp();
  const { lang, setLang, t } = useLang();

  // ── Auth state ──────────────────────────────────────────────────────────────
  const [authEmail, setAuthEmail] = useState('');
  const [authError, setAuthError] = useState('');
  const [authedInterviewer, setAuthedInterviewer] = useState<typeof interviewers[0] | null>(null);

  // ── Form state ──────────────────────────────────────────────────────────────
  const [score, setScore] = useState<number | null>(null);
  const [feedbackMap, setFeedbackMap] = useState<Record<string, string>>({});
  const [commentMap, setCommentMap] = useState<Record<string, string>>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [saved, setSaved] = useState(false);

  let tokenValid = false;
  try {
    const decoded = atob(token ?? '');
    tokenValid = decoded === `${applicationId}:${stageId}`;
  } catch { tokenValid = false; }

  const application = applications.find(a => a.id === applicationId);
  const candidate = application ? candidates.find(c => c.id === application.candidate_id) : null;
  const job = application ? jobs.find(j => j.id === application.job_id) : null;
  const stage = stages.find(s => s.id === stageId);

  const jobQuestions = [...interviewQuestions]
    .filter(q => q.job_id === application?.job_id && q.stage_id === stageId)
    .sort((a, b) => a.display_order - b.display_order);

  const assignedInterviewerIds = application?.stageInterviewers?.[stageId ?? ''] ?? [];
  const assignedInterviewers = interviewers.filter(iv => assignedInterviewerIds.includes(iv.id));

  // Look up feedback form questions for the authed interviewer
  const feedbackFormId = authedInterviewer
    ? application?.stageInterviewerMeta?.[stageId!]?.[authedInterviewer.id]?.feedbackFormId
    : undefined;
  const feedbackForm = feedbackFormId ? feedbackForms.find(f => f.id === feedbackFormId) : undefined;
  const formQuestions: FeedbackFormQuestion[] = feedbackForm
    ? [...feedbackForm.questions].sort((a, b) => a.display_order - b.display_order)
    : [];

  // Lang toggle button (for pages without Navbar)
  const LangToggle = () => (
    <button
      onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
      className="px-2.5 py-1 rounded-lg text-xs font-semibold border border-zinc-200 hover:bg-zinc-50 text-zinc-600 transition-colors"
    >
      {lang === 'en' ? t('nav_lang_toggle') : t('nav_lang_toggle_en')}
    </button>
  );

  if (!tokenValid || !application || !candidate) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-zinc-200 p-8 max-w-md w-full text-center shadow-sm">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X size={24} className="text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 mb-2">{t('feedback_invalid_link')}</h2>
          <p className="text-zinc-500 text-sm">{t('feedback_invalid_desc')}</p>
        </div>
      </div>
    );
  }

  if (!authedInterviewer) {
    const handleLogin = () => {
      const match = assignedInterviewers.find(iv => iv.email.toLowerCase() === authEmail.trim().toLowerCase());
      if (!match) {
        setAuthError(t('feedback_email_error'));
        return;
      }
      const formId = application.stageInterviewerMeta?.[stageId!]?.[match.id]?.feedbackFormId;
      if (formId === 'ff8' && authEmail.trim().toLowerCase() !== 'yi@infstones.com') {
        setAuthError('Access restricted. Only the designated interviewer can access this form.');
        return;
      }
      setAuthedInterviewer(match);
      setAuthError('');
    };

    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-zinc-200 p-8 max-w-sm w-full shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <img src={logoSrc} alt="InfStones" className="w-8 h-8 rounded-lg object-cover" />
              <span className="text-zinc-800 font-semibold text-sm">{t('feedback_platform_title')}</span>
            </div>
            <LangToggle />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 mb-1">{t('feedback_sign_in_title')}</h2>
          <p className="text-zinc-500 text-sm mb-6">
            {t('feedback_sign_in_desc_prefix')}{' '}
            <span className="font-medium text-zinc-700">{candidate.name}</span>.
          </p>

          <div className="mb-4">
            <label className="text-sm font-medium text-zinc-700 block mb-1.5">{t('feedback_email_label')}</label>
            <input
              type="email"
              value={authEmail}
              onChange={e => { setAuthEmail(e.target.value); setAuthError(''); }}
              placeholder={t('feedback_email_placeholder')}
              className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>
          {authError && <p className="text-xs text-red-500 mb-3">{authError}</p>}
          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            {t('feedback_continue_google')}
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-zinc-200 p-8 max-w-md w-full text-center shadow-sm">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-zinc-900 mb-2">{t('feedback_submitted_title')}</h2>
          <p className="text-zinc-500 text-sm">
            {t('feedback_submitted_desc_prefix')}{' '}
            <span className="font-medium text-zinc-700">{candidate.name}</span>{' '}
            {t('feedback_submitted_desc_suffix')}
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = (isDraft: boolean) => {
    if (!isDraft && score === null) {
      alert(t('feedback_score_required'));
      return;
    }
    const activeQuestions = formQuestions.length > 0 ? formQuestions : jobQuestions;
    const questions = activeQuestions.map(q => ({
      question: q.question,
      feedback: feedbackMap[q.id] ?? '',
      comment: commentMap[q.id] ?? '',
    }));
    dispatch({
      type: 'SUBMIT_FEEDBACK',
      applicationId: applicationId!,
      stageId: stageId!,
      interviewerId: authedInterviewer.id,
      score: score ?? 0,
      questions,
    });
    if (!isDraft) {
      setSubmitted(true);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const scoreLabel = (n: number) =>
    n === 1 ? t('feedback_score_1') :
    n === 2 ? t('feedback_score_2') :
    n === 3 ? t('feedback_score_3') :
    t('feedback_score_4');

  const sourceColors: Record<string, string> = {
    LinkedIn: 'bg-blue-100 text-blue-700',
    Referral: 'bg-purple-100 text-purple-700',
    Website: 'bg-zinc-100 text-zinc-600',
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-zinc-50">
      {/* Header */}
      <nav className="bg-white border-b border-zinc-200 px-6 py-3 flex items-center justify-between flex-shrink-0 z-40">
        <div className="flex items-center gap-2">
          <img src={logoSrc} alt="InfStones" className="w-8 h-8 rounded-lg object-cover" />
          <span className="text-zinc-800 font-semibold text-sm">{t('feedback_header_title')}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold border border-zinc-200 hover:bg-zinc-50 text-zinc-600 transition-colors"
          >
            {lang === 'en' ? t('nav_lang_toggle') : t('nav_lang_toggle_en')}
          </button>
          <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-semibold">
            {authedInterviewer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </div>
          <span className="text-zinc-600 text-sm">{authedInterviewer.name}</span>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
            {/* Stage badge */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-500">{t('feedback_stage')}</span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: stage?.color ?? '#6366f1' }}>
                {stage?.name}
              </span>
            </div>

            {/* Candidate info */}
            <div className="bg-white rounded-xl border border-zinc-200 p-5">
              <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-4">{t('feedback_candidate')}</h2>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg">
                  {candidate.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                <div>
                  <h3 className="text-zinc-900 font-semibold text-lg">{candidate.name}</h3>
                  <p className="text-zinc-500 text-sm">{candidate.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-zinc-400 block text-xs mb-0.5">{t('feedback_phone')}</span>
                  <span className="text-zinc-700">{candidate.phone}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-xs mb-0.5">{t('feedback_source')}</span>
                  <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${sourceColors[candidate.source] ?? 'bg-zinc-100 text-zinc-600'}`}>
                    {candidate.source}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-xs mb-0.5">{t('feedback_applied')}</span>
                  <span className="text-zinc-700">{formatDate(application.applied_at)}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-xs mb-0.5">{t('feedback_job')}</span>
                  <span className="text-zinc-700">{job?.title}</span>
                </div>
              </div>
            </div>

            {/* Resume */}
            {candidate.resume_path && (
              <div className="bg-white rounded-xl border border-zinc-200 p-5">
                <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-3">{t('feedback_resume')}</h2>
                <button
                  onClick={() => setDrawerOpen(true)}
                  className="flex items-center gap-3 p-3 bg-zinc-50 rounded-lg border border-zinc-200 w-full text-left hover:bg-indigo-50 hover:border-indigo-200 transition-colors group"
                >
                  <Paperclip size={16} className="text-indigo-500 flex-shrink-0" />
                  <span className="text-zinc-700 text-sm group-hover:text-indigo-700">{candidate.resume_path}</span>
                </button>
              </div>
            )}

            {/* Score */}
            <div className="bg-white rounded-xl border border-zinc-200 p-5">
              <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-4">{t('feedback_score')}</h2>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4].map(n => (
                  <button
                    key={n}
                    onClick={() => setScore(n)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      size={28}
                      className={n <= (score ?? 0) ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-200 fill-zinc-200'}
                    />
                  </button>
                ))}
                {score !== null && (
                  <span className="text-sm font-medium ml-2" style={{ color: score >= 3 ? '#22c55e' : '#ef4444' }}>
                    {scoreLabel(score)}
                  </span>
                )}
              </div>
            </div>

            {/* Feedback */}
            {(formQuestions.length > 0 ? formQuestions : jobQuestions).length > 0 && (
              <div className="bg-white rounded-xl border border-zinc-200 p-5">
                <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-4">Feedback</h2>
                <div className="space-y-5">
                  {(formQuestions.length > 0 ? formQuestions : jobQuestions).map((q, idx) => (
                    <div key={q.id}>
                      <label className="block text-sm font-semibold text-zinc-800 mb-2">
                        {q.question}
                      </label>
                      {/* Type-specific input */}
                      {'answer_type' in q && q.answer_type === 'dropdown' && q.options ? (
                        <select
                          value={feedbackMap[q.id] ?? ''}
                          onChange={e => setFeedbackMap(prev => ({ ...prev, [q.id]: e.target.value }))}
                          className="w-full border border-zinc-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                        >
                          <option value="">Select...</option>
                          {q.options.map((opt, i) => (
                            <option key={i} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : 'answer_type' in q && q.answer_type === 'text_single' ? (
                        <input
                          type="text"
                          value={feedbackMap[q.id] ?? ''}
                          onChange={e => setFeedbackMap(prev => ({ ...prev, [q.id]: e.target.value }))}
                          placeholder={t('feedback_enter_feedback')}
                          className="w-full border border-zinc-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                      ) : 'answer_type' in q && q.answer_type === 'yes_no' ? (
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-1.5 text-sm text-zinc-700">
                            <input
                              type="radio"
                              name={`yn-${q.id}`}
                              value="Yes"
                              checked={feedbackMap[q.id] === 'Yes'}
                              onChange={() => setFeedbackMap(prev => ({ ...prev, [q.id]: 'Yes' }))}
                            />
                            Yes
                          </label>
                          <label className="flex items-center gap-1.5 text-sm text-zinc-700">
                            <input
                              type="radio"
                              name={`yn-${q.id}`}
                              value="No"
                              checked={feedbackMap[q.id] === 'No'}
                              onChange={() => setFeedbackMap(prev => ({ ...prev, [q.id]: 'No' }))}
                            />
                            No
                          </label>
                        </div>
                      ) : 'answer_type' in q && q.answer_type === 'score' ? (
                        <input
                          type="number"
                          value={feedbackMap[q.id] ?? ''}
                          onChange={e => setFeedbackMap(prev => ({ ...prev, [q.id]: e.target.value }))}
                          min={(q as any).score_min ?? 0}
                          max={(q as any).score_max ?? 10}
                          className="w-32 border border-zinc-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                      ) : (
                        <textarea
                          value={feedbackMap[q.id] ?? ''}
                          onChange={e => setFeedbackMap(prev => ({ ...prev, [q.id]: e.target.value }))}
                          placeholder={t('feedback_enter_feedback')}
                          rows={3}
                          className="w-full border border-zinc-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                        />
                      )}
                      {/* Comments (Optional) */}
                      <label className="block text-xs text-zinc-400 mt-2 mb-1">Comments (Optional)</label>
                      <textarea
                        value={commentMap[q.id] ?? ''}
                        onChange={e => setCommentMap(prev => ({ ...prev, [q.id]: e.target.value }))}
                        placeholder="Add comments..."
                        rows={3}
                        className="w-full border border-zinc-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pb-8">
              <button
                onClick={() => handleSubmit(true)}
                className="flex-1 py-3 rounded-xl border border-zinc-300 text-zinc-700 font-medium text-sm hover:bg-zinc-50 transition-colors"
              >
                {saved ? t('feedback_draft_saved') : t('feedback_save_draft')}
              </button>
              <button
                onClick={() => handleSubmit(false)}
                className="flex-1 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-medium text-sm transition-colors"
              >
                {t('feedback_submit')}
              </button>
            </div>
          </div>
        </div>

        {/* Resume Drawer */}
        {drawerOpen && (
          <div className="w-[820px] max-w-[55vw] flex-shrink-0 bg-white border-l border-zinc-200 flex flex-col h-full shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Paperclip size={15} className="text-indigo-500" />
                <span className="text-sm font-medium text-zinc-800">{candidate.resume_path}</span>
              </div>
              <button onClick={() => setDrawerOpen(false)} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 bg-zinc-100 flex flex-col items-center justify-center gap-4 p-8 overflow-y-auto">
              <div className="w-20 h-20 rounded-2xl bg-zinc-200 flex items-center justify-center">
                <FileText size={36} className="text-zinc-400" />
              </div>
              <div className="text-center">
                <p className="text-zinc-500 font-medium text-sm mb-1">{t('feedback_pdf_preview')}</p>
                <p className="text-zinc-400 text-xs">{candidate.resume_path}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
