import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Paperclip, FileText, X, Check, Star, Pencil, AlertCircle } from 'lucide-react';
import { REJECT_REASON_KEYS } from '../mock/data';
import type { RejectReasonTag } from '../mock/data';
import Navbar from '../components/Navbar';
import { useApp } from '../context/AppContext';
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

export default function ApplicationDetailPage() {
  const { id: appId } = useParams<{ id: string }>();
  const { applications, candidates, jobs, stages, interviewers, feedbackForms, feedbackFormGroups, currentUser, dispatch } = useApp();
  const { t } = useLang();

  // ── Move Stage modal ────────────────────────────────────────────────────────
  const [moveStageModalOpen, setMoveStageModalOpen] = useState(false);
  const [selectedNewStage, setSelectedNewStage] = useState<string>('');
  const [feedbackLinkResult, setFeedbackLinkResult] = useState<{ stageId: string; url: string } | null>(null);
  const [_copied, setCopied] = useState(false);

  // ── Reject reason (for Rejected stage) ─────────────────────────────────────
  const REJECTED_STAGE_ID = 's6';
  const [rejectTag, setRejectTag] = useState<RejectReasonTag | ''>('');
  const [rejectOtherText, setRejectOtherText] = useState('');
  const [rejectDescription, setRejectDescription] = useState('');
  const isMovingToRejected = selectedNewStage === REJECTED_STAGE_ID;

  const canConfirmReject = rejectTag !== '' && (rejectTag !== 'other' || rejectOtherText.trim() !== '') && rejectDescription.trim() !== '';

  // ── Stage Interviewer edit ──────────────────────────────────────────────────
  const [editingStageId, setEditingStageId] = useState<string | null>(null);
  const [editingInterviewerIds, setEditingInterviewerIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // ── Resume drawer ───────────────────────────────────────────────────────────
  const [drawerOpen, setDrawerOpen] = useState(false);

  // ── Feedback stage tab ──────────────────────────────────────────────────────
  const [feedbackStageId, setFeedbackStageId] = useState<string | null>(null);

  // ── Interviewer meta: meeting time editing ──────────────────────────────────
  const [editingMeetingTime, setEditingMeetingTime] = useState<{ stageId: string; ivId: string; value: string } | null>(null);
  // ── Confirm modals ──────────────────────────────────────────────────────────
  type ConfirmModalType = 'email' | 'calendar';
  const [confirmModal, setConfirmModal] = useState<{ type: ConfirmModalType; stageId: string; ivId: string } | null>(null);
  // Stage-level send invite email
  const [stageEmailModal, setStageEmailModal] = useState<{ stageId: string } | null>(null);
  const [stageEmailSent, setStageEmailSent] = useState(false);
  // Feedback form search per interviewer
  const [feedbackFormSearch, setFeedbackFormSearch] = useState<{ stageId: string; ivId: string } | null>(null);
  const [feedbackFormQuery, setFeedbackFormQuery] = useState('');

  const application = applications.find(a => a.id === appId);

  if (!application) {
    return (
      <div className="min-h-screen bg-zinc-50">
        <Navbar />
        <div className="flex items-center justify-center h-64 text-zinc-400">{t('app_detail_application_not_found')}</div>
      </div>
    );
  }

  const candidate = candidates.find(c => c.id === application.candidate_id);
  const job = jobs.find(j => j.id === application.job_id);
  const currentStage = stages.find(s => s.id === application.stage_id);
  const sortedStages = [...stages].sort((a, b) => a.display_order - b.display_order);

  const activeFeedbackStageId = feedbackStageId ?? application.stage_id;
  const currentStageOrder = currentStage?.display_order ?? 0;
  const stageFeedbackByInterviewer = application.stageFeedback?.[activeFeedbackStageId] ?? null;

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

  const openMoveStageModal = () => {
    setSelectedNewStage(application.stage_id);
    setFeedbackLinkResult(null);
    setCopied(false);
    setRejectTag('');
    setRejectOtherText('');
    setRejectDescription('');
    setMoveStageModalOpen(true);
  };

  const buildFeedbackUrl = (aId: string, sId: string) => {
    const token = btoa(`${aId}:${sId}`);
    const base = `${window.location.origin}${window.location.pathname.split('#')[0]}`;
    return `${base}#/feedback/${aId}/${sId}?token=${token}`;
  };

  const handleMoveStageConfirm = () => {
    if (!selectedNewStage) return;
    // If moving to Rejected, save reject info first
    if (isMovingToRejected) {
      if (!canConfirmReject) return;
      const effectiveTag = rejectTag as RejectReasonTag;
      dispatch({
        type: 'SET_REJECT_INFO',
        applicationId: appId!,
        rejectInfo: {
          tag: effectiveTag,
          description: effectiveTag === 'other' ? rejectOtherText.trim() + (rejectDescription.trim() ? ': ' + rejectDescription.trim() : '') : rejectDescription.trim(),
        },
      });
    }
    dispatch({ type: 'MOVE_APPLICATION', applicationId: appId!, newStageId: selectedNewStage, userId: currentUser?.id ?? 'u1' });
    const assignedIds = application.stageInterviewers?.[selectedNewStage] ?? [];
    const targetStage = stages.find(s => s.id === selectedNewStage);
    const hasInterviewers = targetStage?.needInterviewer && assignedIds.length > 0;
    if (hasInterviewers) {
      const token = btoa(`${appId}:${selectedNewStage}`);
      dispatch({ type: 'SET_FEEDBACK_LINK', applicationId: appId!, stageId: selectedNewStage, token });
      const url = buildFeedbackUrl(appId!, selectedNewStage);
      setFeedbackLinkResult({ stageId: selectedNewStage, url });
    } else {
      setFeedbackLinkResult({ stageId: selectedNewStage, url: '' });
    }
  };

  const formatMeetingTime = (val: string): string => {
    const [date, time] = val.split('T');
    if (!date || !time) return val;
    const [yyyy, mm, dd] = date.split('-');
    return `${mm}-${dd}-${yyyy} ${time.slice(0, 5)}`;
  };

  const getMeta = (stageId: string, ivId: string) =>
    application.stageInterviewerMeta?.[stageId]?.[ivId] ?? {};

  const saveMeetingTime = () => {
    if (!editingMeetingTime || !appId) return;
    dispatch({
      type: 'SET_INTERVIEWER_META',
      applicationId: appId,
      stageId: editingMeetingTime.stageId,
      interviewerId: editingMeetingTime.ivId,
      meta: { meetingTime: editingMeetingTime.value },
    });
    setEditingMeetingTime(null);
  };

  const handleConfirm = () => {
    if (!confirmModal || !appId) return;
    const { type, stageId, ivId } = confirmModal;
    const now = new Date().toISOString();
    dispatch({
      type: 'SET_INTERVIEWER_META',
      applicationId: appId,
      stageId,
      interviewerId: ivId,
      meta: type === 'email'
        ? { inviteEmailSent: true, inviteEmailSentAt: now }
        : { calendarCreated: true, calendarCreatedAt: now },
    });
    setConfirmModal(null);
  };

  const closeMoveModal = () => {
    setMoveStageModalOpen(false);
    setFeedbackLinkResult(null);
    setCopied(false);
    setSelectedNewStage('');
    setRejectTag('');
    setRejectOtherText('');
    setRejectDescription('');
  };

  const openInterviewerEdit = (stageId: string) => {
    const current = application.stageInterviewers?.[stageId] ?? [];
    setEditingStageId(stageId);
    setEditingInterviewerIds([...current]);
    setSearchQuery('');
  };

  const toggleInterviewer = (ivId: string) => {
    setEditingInterviewerIds(prev =>
      prev.includes(ivId) ? prev.filter(id => id !== ivId) : [...prev, ivId]
    );
  };

  const saveInterviewers = () => {
    if (!editingStageId) return;
    dispatch({ type: 'UPDATE_STAGE_INTERVIEWERS', applicationId: appId!, stageId: editingStageId, interviewerIds: editingInterviewerIds });
    setEditingStageId(null);
    setEditingInterviewerIds([]);
    setSearchQuery('');
  };

  const cancelInterviewerEdit = () => {
    setEditingStageId(null);
    setEditingInterviewerIds([]);
    setSearchQuery('');
  };

  const filteredInterviewers = interviewers.filter(iv => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return iv.name.toLowerCase().includes(q) || iv.email.toLowerCase().includes(q);
  });

  const scoreLabel = (score: number) =>
    score === 1 ? t('app_detail_score_1') :
    score === 2 ? t('app_detail_score_2') :
    score === 3 ? t('app_detail_score_3') :
    t('app_detail_score_4');

  const renderStars = (score: number | null) => {
    if (score === null) return <span className="text-zinc-400 text-sm">{t('app_detail_no_score')}</span>;
    return (
      <div className="flex items-center gap-0.5 flex-wrap">
        {[1, 2, 3, 4].map(n => (
          <Star key={n} size={14} className={n <= score ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-200 fill-zinc-200'} />
        ))}
        <span className="text-xs font-medium ml-1.5" style={{ color: score >= 3 ? '#22c55e' : '#ef4444' }}>
          {scoreLabel(score)}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <Navbar backLink={{ to: `/jobs/${application.job_id}/kanban`, label: job?.title ?? 'Kanban' }} title={candidate?.name} />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ═══ LEFT PANEL ═══ */}
          <div className="space-y-5">

            {/* STAGES */}
            <div className="bg-white rounded-xl border border-zinc-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide">{t('app_detail_stages')}</h2>
                <button
                  onClick={openMoveStageModal}
                  className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-colors"
                >
                  {t('app_detail_move_stage')}
                </button>
              </div>

              <div className="space-y-1">
                {sortedStages.map(stage => {
                  const isCurrent = stage.id === application.stage_id;
                  const assignedIds = application.stageInterviewers?.[stage.id] ?? [];
                  const isEditing = editingStageId === stage.id;
                  return (
                    <div
                      key={stage.id}
                      className={`rounded-lg px-3 py-2.5 ${isCurrent ? 'bg-indigo-50 border border-indigo-200' : 'border border-transparent'}`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: stage.color }} />
                        <span className={`text-sm flex-1 ${isCurrent ? 'text-indigo-700 font-semibold' : 'text-zinc-600 font-medium'}`}>
                          {stage.name}
                        </span>
                      </div>

                      {stage.needInterviewer && (
                        isEditing ? (
                          <div className="mt-2 ml-4">
                            <input
                              type="text"
                              value={searchQuery}
                              onChange={e => setSearchQuery(e.target.value)}
                              placeholder={t('app_detail_search_interviewers')}
                              className="w-full border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400 mb-1"
                              autoFocus
                            />
                            <div className="border border-zinc-200 rounded-lg divide-y divide-zinc-100 mb-2 max-h-40 overflow-y-auto">
                              {filteredInterviewers.length === 0 ? (
                                <div className="px-3 py-2 text-xs text-zinc-400">{t('app_detail_no_matches')}</div>
                              ) : (
                                filteredInterviewers.map(iv => (
                                  <label key={iv.id} className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-zinc-50 text-xs">
                                    <input
                                      type="checkbox"
                                      checked={editingInterviewerIds.includes(iv.id)}
                                      onChange={() => toggleInterviewer(iv.id)}
                                      className="accent-indigo-500"
                                    />
                                    <div>
                                      <div className="font-medium text-zinc-700">{iv.name}</div>
                                      <div className="text-zinc-400">{iv.email}</div>
                                    </div>
                                  </label>
                                ))
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <button onClick={saveInterviewers} className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium">
                                <Check size={12} /> {t('app_detail_save')}
                              </button>
                              <span className="text-zinc-300">·</span>
                              <button onClick={cancelInterviewerEdit} className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600">
                                <X size={12} /> {t('app_detail_cancel')}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-1 ml-4">
                            {assignedIds.length === 0 ? (
                              <button onClick={() => openInterviewerEdit(stage.id)} className="text-xs text-indigo-500 hover:text-indigo-700 font-medium">
                                {t('app_detail_add_interviewer')}
                              </button>
                            ) : (
                              <div className="space-y-2 mt-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs text-zinc-400">{t('app_detail_interviewers_label')}</span>
                                  <button onClick={() => openInterviewerEdit(stage.id)} className="text-zinc-400 hover:text-indigo-600 transition-colors" title="Edit interviewers">
                                    <Pencil size={11} />
                                  </button>
                                </div>
                                {assignedIds.map(ivId => {
                                  const iv = interviewers.find(i => i.id === ivId);
                                  const meta = getMeta(stage.id, ivId);
                                  const isEditingMT = editingMeetingTime?.stageId === stage.id && editingMeetingTime?.ivId === ivId;
                                  const canAction = !!meta.meetingTime;
                                  const isSearchingForm = feedbackFormSearch?.stageId === stage.id && feedbackFormSearch?.ivId === ivId;
                                  const selectedFeedbackForm = meta.feedbackFormId ? feedbackForms.find(f => f.id === meta.feedbackFormId) : null;
                                  const selectedFormGroup = selectedFeedbackForm?.group_id ? feedbackFormGroups.find(g => g.id === selectedFeedbackForm.group_id) : null;
                                  return (
                                    <div key={ivId} className="bg-zinc-50 rounded-lg p-2 text-xs border border-zinc-100">
                                      <div className="font-medium text-zinc-700 mb-1.5">{iv?.name ?? ivId}</div>

                                      {/* Meeting Time */}
                                      <div className="mb-1.5">
                                        {isEditingMT ? (
                                          <div className="flex items-center gap-1 flex-wrap">
                                            <input
                                              type="date"
                                              value={editingMeetingTime.value.split('T')[0] ?? ''}
                                              onChange={e => {
                                                const time = editingMeetingTime.value.split('T')[1] ?? '09:00';
                                                setEditingMeetingTime({ ...editingMeetingTime, value: `${e.target.value}T${time}` });
                                              }}
                                              className="border border-zinc-200 rounded px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
                                            />
                                            <select
                                              value={editingMeetingTime.value.split('T')[1]?.slice(0, 2) ?? '09'}
                                              onChange={e => {
                                                const [d] = editingMeetingTime.value.split('T');
                                                const min = editingMeetingTime.value.split('T')[1]?.slice(3, 5) ?? '00';
                                                setEditingMeetingTime({ ...editingMeetingTime, value: `${d}T${e.target.value.padStart(2, '0')}:${min}` });
                                              }}
                                              className="border border-zinc-200 rounded px-1 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
                                            >
                                              {Array.from({ length: 24 }, (_, i) => (
                                                <option key={i} value={String(i).padStart(2, '0')}>{String(i).padStart(2, '0')}</option>
                                              ))}
                                            </select>
                                            <span className="text-xs text-zinc-400">:</span>
                                            <select
                                              value={(() => {
                                                const m = parseInt(editingMeetingTime.value.split('T')[1]?.slice(3, 5) ?? '0');
                                                return [0, 15, 30, 45].reduce((prev, cur) => Math.abs(cur - m) < Math.abs(prev - m) ? cur : prev, 0);
                                              })()}
                                              onChange={e => {
                                                const [d] = editingMeetingTime.value.split('T');
                                                const hr = editingMeetingTime.value.split('T')[1]?.slice(0, 2) ?? '09';
                                                setEditingMeetingTime({ ...editingMeetingTime, value: `${d}T${hr}:${e.target.value}` });
                                              }}
                                              className="border border-zinc-200 rounded px-1 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
                                            >
                                              {['00', '15', '30', '45'].map(m => (
                                                <option key={m} value={m}>{m}</option>
                                              ))}
                                            </select>
                                            <button onClick={saveMeetingTime} className="text-green-600 hover:text-green-700 font-medium text-xs">{t('app_detail_save')}</button>
                                            <button onClick={() => setEditingMeetingTime(null)} className="text-zinc-400 hover:text-zinc-600 text-xs">✕</button>
                                          </div>
                                        ) : meta.meetingTime ? (
                                          <div className="flex items-center gap-1.5 text-zinc-600">
                                            <span>{formatMeetingTime(meta.meetingTime)} (UTC+8)</span>
                                            <button onClick={() => setEditingMeetingTime({ stageId: stage.id, ivId, value: meta.meetingTime! })} className="text-zinc-400 hover:text-indigo-500"><Pencil size={10} /></button>
                                          </div>
                                        ) : (
                                          <button
                                            onClick={() => setEditingMeetingTime({ stageId: stage.id, ivId, value: '' })}
                                            className="text-indigo-500 hover:text-indigo-700 font-medium"
                                          >
                                            {t('app_detail_set_meeting_time')}
                                          </button>
                                        )}
                                      </div>

                                      {/* Select Feedback Form */}
                                      <div className="mb-1">
                                        {isSearchingForm ? (
                                          <div className="relative">
                                            <input
                                              type="text"
                                              value={feedbackFormQuery}
                                              onChange={e => setFeedbackFormQuery(e.target.value)}
                                              placeholder="Search feedback forms..."
                                              className="w-full border border-indigo-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
                                              autoFocus
                                            />
                                            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-zinc-200 rounded-lg shadow-lg max-h-40 overflow-y-auto z-10">
                                              <button
                                                onClick={() => {
                                                  dispatch({ type: 'SET_INTERVIEWER_META', applicationId: appId!, stageId: stage.id, interviewerId: ivId, meta: { feedbackFormId: undefined } });
                                                  setFeedbackFormSearch(null);
                                                  setFeedbackFormQuery('');
                                                }}
                                                className="w-full text-left px-2.5 py-1.5 text-xs text-zinc-400 hover:bg-zinc-50 italic"
                                              >
                                                — None —
                                              </button>
                                              {feedbackForms
                                                .filter(f => !feedbackFormQuery.trim() || f.name.toLowerCase().includes(feedbackFormQuery.toLowerCase()))
                                                .map(f => {
                                                  const g = f.group_id ? feedbackFormGroups.find(g => g.id === f.group_id) : null;
                                                  return (
                                                    <button
                                                      key={f.id}
                                                      onClick={() => {
                                                        dispatch({ type: 'SET_INTERVIEWER_META', applicationId: appId!, stageId: stage.id, interviewerId: ivId, meta: { feedbackFormId: f.id } });
                                                        setFeedbackFormSearch(null);
                                                        setFeedbackFormQuery('');
                                                      }}
                                                      className={`w-full text-left px-2.5 py-1.5 text-xs hover:bg-indigo-50 ${meta.feedbackFormId === f.id ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-zinc-700'}`}
                                                    >
                                                      {g ? <span className="text-zinc-400">{g.name} / </span> : null}
                                                      {f.name}
                                                    </button>
                                                  );
                                                })}
                                            </div>
                                            <button
                                              onClick={() => { setFeedbackFormSearch(null); setFeedbackFormQuery(''); }}
                                              className="absolute right-1 top-1 text-zinc-400 hover:text-zinc-600 text-[10px]"
                                            >✕</button>
                                          </div>
                                        ) : selectedFeedbackForm ? (
                                          <div className="flex items-center gap-1 text-zinc-600">
                                            <span className="truncate">
                                              {selectedFormGroup ? <span className="text-zinc-400">{selectedFormGroup.name} / </span> : null}
                                              {selectedFeedbackForm.name}
                                            </span>
                                            <button
                                              onClick={() => { setFeedbackFormSearch({ stageId: stage.id, ivId }); setFeedbackFormQuery(''); }}
                                              className="text-zinc-400 hover:text-indigo-500 flex-shrink-0 ml-1"
                                            ><Pencil size={10} /></button>
                                          </div>
                                        ) : (
                                          <button
                                            onClick={() => { setFeedbackFormSearch({ stageId: stage.id, ivId }); setFeedbackFormQuery(''); }}
                                            className="text-indigo-500 hover:text-indigo-700 font-medium"
                                          >
                                            Select Feedback Form
                                          </button>
                                        )}
                                      </div>

                                      {/* Create Calendar */}
                                      <div>
                                        {meta.calendarCreated ? (
                                          <span className="text-green-600 flex items-center gap-1">
                                            <Check size={10} /> {t('app_detail_calendar_created')}
                                            <button onClick={() => setConfirmModal({ type: 'calendar', stageId: stage.id, ivId })} className="text-zinc-400 hover:text-indigo-500 ml-1">{t('app_detail_recreate')}</button>
                                          </span>
                                        ) : (
                                          <button
                                            disabled={!canAction}
                                            onClick={() => setConfirmModal({ type: 'calendar', stageId: stage.id, ivId })}
                                            className={`font-medium text-left block ${canAction ? 'text-indigo-500 hover:text-indigo-700' : 'text-zinc-300 cursor-not-allowed'}`}
                                          >{t('app_detail_create_calendar')}</button>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}

                                {/* Stage-level Send Invite Email */}
                                {(() => {
                                  const allHaveMeetingTime = assignedIds.every(ivId => !!getMeta(stage.id, ivId).meetingTime);
                                  const anyEmailSent = assignedIds.some(ivId => !!getMeta(stage.id, ivId).inviteEmailSent);
                                  return (
                                    <div className="mt-2 pt-2 border-t border-zinc-100">
                                      {anyEmailSent ? (
                                        <div className="flex items-center gap-2">
                                          <span className="text-green-600 flex items-center gap-1 text-xs">
                                            <Check size={11} /> Invite Email Sent
                                          </span>
                                          <button
                                            onClick={() => { setStageEmailModal({ stageId: stage.id }); setStageEmailSent(false); }}
                                            className="text-xs text-zinc-400 hover:text-indigo-500"
                                          >Resend</button>
                                        </div>
                                      ) : (
                                        <button
                                          disabled={!allHaveMeetingTime || assignedIds.length === 0}
                                          onClick={() => { setStageEmailModal({ stageId: stage.id }); setStageEmailSent(false); }}
                                          className={`w-full py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                            allHaveMeetingTime && assignedIds.length > 0
                                              ? 'bg-indigo-500 text-white hover:bg-indigo-600'
                                              : 'bg-zinc-100 text-zinc-300 cursor-not-allowed'
                                          }`}
                                        >
                                          Send Invite Email
                                        </button>
                                      )}
                                      {!allHaveMeetingTime && assignedIds.length > 0 && (
                                        <p className="text-[10px] text-zinc-400 mt-1">Set meeting time for all interviewers to enable</p>
                                      )}
                                    </div>
                                  );
                                })()}
                              </div>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* APPLICATION INFO */}
            <div className="bg-white rounded-xl border border-zinc-200 p-5">
              <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-3">{t('app_detail_application_info')}</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-zinc-400 block text-xs mb-0.5">{t('app_detail_applied')}</span>
                  <span className="text-zinc-700">{formatDate(application.applied_at)}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-xs mb-0.5">{t('app_detail_current_stage')}</span>
                  <span className="inline-block text-xs font-semibold px-2 py-1 rounded-full text-white" style={{ backgroundColor: currentStage?.color }}>
                    {currentStage?.name}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-xs mb-0.5">{t('app_detail_job')}</span>
                  <span className="text-zinc-700">{job?.title}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-xs mb-0.5">{t('app_detail_department')}</span>
                  <span className="text-zinc-700">{job?.department}</span>
                </div>
                {candidate?.current_company && (
                  <div>
                    <span className="text-zinc-400 block text-xs mb-0.5">{t('app_detail_current_company')}</span>
                    <span className="text-zinc-700">{candidate.current_company}</span>
                  </div>
                )}
                {candidate?.current_title && (
                  <div>
                    <span className="text-zinc-400 block text-xs mb-0.5">{t('app_detail_current_title')}</span>
                    <span className="text-zinc-700">{candidate.current_title}</span>
                  </div>
                )}
                {candidate?.linkedin && (
                  <div>
                    <span className="text-zinc-400 block text-xs mb-0.5">{t('app_detail_linkedin')}</span>
                    <a href={candidate.linkedin} target="_blank" rel="noreferrer"
                      className="text-indigo-500 hover:text-indigo-700 text-sm break-all">
                      {candidate.linkedin.replace('https://linkedin.com/in/', '')}
                    </a>
                  </div>
                )}
                {candidate?.portfolio && (
                  <div>
                    <span className="text-zinc-400 block text-xs mb-0.5">{t('app_detail_portfolio')}</span>
                    <a href={candidate.portfolio} target="_blank" rel="noreferrer"
                      className="text-indigo-500 hover:text-indigo-700 text-sm break-all">
                      {candidate.portfolio.replace('https://', '')}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ═══ RIGHT PANEL ═══ */}
          <div className="lg:col-span-2 space-y-5">

            {/* CANDIDATE */}
            <div className="bg-white rounded-xl border border-zinc-200 p-5">
              <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-4">{t('app_detail_candidate')}</h2>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg">
                  {candidate?.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                <div>
                  <h3 className="text-zinc-900 font-semibold text-lg">{candidate?.name}</h3>
                  <p className="text-zinc-500 text-sm">{candidate?.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-zinc-400 block text-xs mb-0.5">{t('app_detail_phone')}</span>
                  <span className="text-zinc-700">{candidate?.phone}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-xs mb-0.5">{t('app_detail_source')}</span>
                  <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${sourceColors[candidate?.source ?? ''] ?? ''}`}>
                    {candidate?.source}
                  </span>
                  {candidate?.source === 'Referral' && candidate.referrer_name && (
                    <p className="text-zinc-500 text-xs mt-1">{t('app_detail_referred_by')}{candidate.referrer_name}</p>
                  )}
                </div>
              </div>
            </div>

            {/* RESUME */}
            <div className="bg-white rounded-xl border border-zinc-200 p-5">
              <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-3">{t('app_detail_resume')}</h2>
              {candidate?.resume_path ? (
                <button
                  onClick={() => setDrawerOpen(true)}
                  className="flex items-center gap-3 p-3 bg-zinc-50 rounded-lg border border-zinc-200 w-full text-left hover:bg-indigo-50 hover:border-indigo-200 transition-colors group"
                >
                  <Paperclip size={16} className="text-indigo-500 flex-shrink-0" />
                  <span className="text-zinc-700 text-sm group-hover:text-indigo-700 transition-colors">{candidate.resume_path}</span>
                </button>
              ) : (
                <p className="text-zinc-400 text-sm">{t('app_detail_no_resume')}</p>
              )}
            </div>

            {/* STAGE FEEDBACK */}
            <div className="bg-white rounded-xl border border-zinc-200 p-5">
              <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-4">{t('app_detail_stage_feedback')}</h2>
              <div className="flex flex-wrap gap-2 mb-5">
                {sortedStages.map(stage => {
                  const isDisabled = stage.display_order > currentStageOrder;
                  const isActive = stage.id === activeFeedbackStageId;
                  return (
                    <button
                      key={stage.id}
                      onClick={() => !isDisabled && setFeedbackStageId(stage.id)}
                      disabled={isDisabled}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                        isDisabled ? 'border-zinc-100 text-zinc-300 bg-zinc-50 cursor-not-allowed'
                          : isActive ? 'border-transparent text-white'
                          : 'border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50'
                      }`}
                      style={isActive && !isDisabled ? { backgroundColor: stage.color, borderColor: stage.color } : {}}
                    >
                      {stage.name}
                    </button>
                  );
                })}
              </div>

              {/* Reject info — shown in Rejected stage tab */}
              {activeFeedbackStageId === REJECTED_STAGE_ID && application.rejectInfo && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4">
                  <div className="flex items-center gap-1.5 text-red-600 font-semibold text-sm mb-2">
                    <AlertCircle size={14} /> {t('reject_label')}
                  </div>
                  <span className="inline-block bg-red-100 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-full mb-2">
                    {t(REJECT_REASON_KEYS[application.rejectInfo.tag] as Parameters<typeof t>[0])}
                  </span>
                  <p className="text-sm text-zinc-700 leading-relaxed">{application.rejectInfo.description}</p>
                </div>
              )}

              {!stageFeedbackByInterviewer || Object.keys(stageFeedbackByInterviewer).length === 0 ? (
                <p className="text-zinc-400 text-sm">{t('app_detail_no_feedback')}</p>
              ) : (
                <div className="space-y-6">
                  {Object.entries(stageFeedbackByInterviewer).map(([ivId, feedbackData]) => {
                    const iv = interviewers.find(i => i.id === ivId);
                    return (
                      <div key={ivId} className="border border-zinc-100 rounded-xl overflow-hidden">
                        <div className="flex items-center gap-2.5 px-4 py-3 bg-zinc-50 border-b border-zinc-100">
                          <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {(iv?.name ?? ivId).split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-zinc-800">{iv?.name ?? ivId}</p>
                            {iv?.email && <p className="text-xs text-zinc-400">{iv.email}</p>}
                          </div>
                          <div className="ml-auto">{renderStars(feedbackData.score)}</div>
                        </div>
                        <div className="p-4 space-y-3">
                          {feedbackData.questions.length === 0 ? (
                            <p className="text-zinc-400 text-sm">{t('app_detail_no_questions')}</p>
                          ) : (
                            feedbackData.questions.map((qa, idx) => (
                              <div key={idx} className="bg-zinc-50 rounded-lg p-3.5 border border-zinc-100">
                                <p className="text-sm font-semibold text-zinc-800 mb-1.5">{qa.question}</p>
                                <p className="text-sm text-zinc-600 leading-relaxed">{qa.feedback}</p>
                                {qa.comment && (
                                  <div className="mt-2 pt-2 border-t border-zinc-100">
                                    <p className="text-xs text-zinc-400 mb-0.5">Comments</p>
                                    <p className="text-sm text-zinc-600">{qa.comment}</p>
                                  </div>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ MOVE STAGE MODAL ═══ */}
      {moveStageModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            {!feedbackLinkResult ? (
              <>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-semibold text-zinc-900">{t('app_detail_move_stage')}</h2>
                  <button onClick={closeMoveModal} className="text-zinc-400 hover:text-zinc-700"><X size={20} /></button>
                </div>
                <p className="text-sm text-zinc-500 mb-4">
                  {t('app_detail_move_modal_prefix')}{' '}
                  <span className="font-medium text-zinc-700">{candidate?.name}</span>{' '}
                  {t('app_detail_move_modal_suffix')}
                </p>
                <div className="space-y-2 mb-6">
                  {sortedStages.map(stage => (
                    <label
                      key={stage.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedNewStage === stage.id
                          ? 'border-indigo-400 bg-indigo-50'
                          : 'border-zinc-200 hover:border-zinc-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="stage"
                        value={stage.id}
                        checked={selectedNewStage === stage.id}
                        onChange={() => setSelectedNewStage(stage.id)}
                        className="accent-indigo-500"
                      />
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
                      <span className="text-sm font-medium text-zinc-700">{stage.name}</span>
                      {stage.id === application.stage_id && (
                        <span className="ml-auto text-xs text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full">{t('app_detail_current_label')}</span>
                      )}
                    </label>
                  ))}
                </div>
                {/* Reject reason section — shown when Rejected stage selected */}
                {isMovingToRejected && (
                  <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4">
                    <div className="flex items-center gap-1.5 text-red-600 font-semibold text-sm mb-3">
                      <AlertCircle size={14} /> {t('reject_required')}
                    </div>
                    <div className="space-y-2 mb-3">
                      {(Object.keys(REJECT_REASON_KEYS) as RejectReasonTag[]).map(key => (
                        <label key={key} className="flex items-center gap-2 cursor-pointer text-sm">
                          <input
                            type="radio"
                            name="rejectTag"
                            value={key}
                            checked={rejectTag === key}
                            onChange={() => setRejectTag(key)}
                            className="accent-red-500"
                          />
                          {t(REJECT_REASON_KEYS[key] as Parameters<typeof t>[0])}
                        </label>
                      ))}
                    </div>
                    {rejectTag === 'other' && (
                      <input
                        type="text"
                        value={rejectOtherText}
                        onChange={e => setRejectOtherText(e.target.value)}
                        placeholder={t('reject_other_placeholder')}
                        className="w-full border border-red-200 rounded-lg px-3 py-1.5 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-red-300"
                      />
                    )}
                    <textarea
                      value={rejectDescription}
                      onChange={e => setRejectDescription(e.target.value)}
                      rows={3}
                      placeholder={t('reject_description_placeholder')}
                      className="w-full border border-red-200 rounded-lg px-3 py-1.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-300"
                    />
                  </div>
                )}
                <div className="flex gap-3">
                  <button onClick={closeMoveModal} className="flex-1 py-2.5 rounded-lg border border-zinc-200 text-zinc-600 text-sm font-medium hover:bg-zinc-50 transition-colors">
                    {t('app_detail_cancel')}
                  </button>
                  <button
                    onClick={handleMoveStageConfirm}
                    disabled={!selectedNewStage || selectedNewStage === application.stage_id || (isMovingToRejected && !canConfirmReject)}
                    className={`flex-1 py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors ${isMovingToRejected ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-500 hover:bg-indigo-600'}`}
                  >
                    {t('app_detail_confirm')}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-zinc-900">{t('app_detail_stage_moved')}</h2>
                  <button onClick={closeMoveModal} className="text-zinc-400 hover:text-zinc-700"><X size={20} /></button>
                </div>
                <p className="text-sm text-zinc-500 mb-6">
                  {t('app_detail_moved_prefix')}{candidate?.name} {t('app_detail_moved_suffix')}{' '}
                  <span className="font-semibold text-zinc-700">
                    {stages.find(s => s.id === feedbackLinkResult.stageId)?.name}
                  </span>.
                </p>
                <button onClick={closeMoveModal} className="w-full py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors">
                  {t('app_detail_done')}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ═══ RESUME DRAWER ═══ */}
      {drawerOpen && (
        <div className="fixed inset-y-0 right-0 z-50 flex justify-end">
          <div className="bg-white w-[820px] max-w-[90vw] h-full shadow-2xl flex flex-col border-l border-zinc-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Paperclip size={15} className="text-indigo-500" />
                <span className="text-sm font-medium text-zinc-800">{candidate?.resume_path}</span>
              </div>
              <button onClick={() => setDrawerOpen(false)} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 bg-zinc-100 flex flex-col items-center justify-center gap-4 p-8">
              <div className="w-20 h-20 rounded-2xl bg-zinc-200 flex items-center justify-center">
                <FileText size={36} className="text-zinc-400" />
              </div>
              <div className="text-center">
                <p className="text-zinc-500 font-medium text-sm mb-1">{t('app_detail_pdf_preview')}</p>
                <p className="text-zinc-400 text-xs">{candidate?.resume_path}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm Modal ─────────────────────────────────────────── */}
      {confirmModal && (() => {
        const { type, stageId, ivId } = confirmModal;
        const iv = interviewers.find(i => i.id === ivId);
        const meta = getMeta(stageId, ivId);
        const isEmail = type === 'email';
        const isResend = isEmail ? !!meta.inviteEmailSent : !!meta.calendarCreated;
        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
              <h3 className="text-lg font-semibold text-zinc-900 mb-4">
                {isResend
                  ? (isEmail ? t('app_detail_send_invite_modal_resend') : t('app_detail_create_cal_modal_recreate'))
                  : (isEmail ? t('app_detail_send_invite_modal_send') : t('app_detail_create_cal_modal_create'))
                }
              </h3>
              <div className="bg-zinc-50 rounded-xl p-4 text-sm text-zinc-700 space-y-2 mb-5 border border-zinc-200">
                {isEmail ? (
                  <>
                    <p><span className="text-zinc-400">{t('app_detail_confirm_to')}</span> {candidate?.email}</p>
                    <p><span className="text-zinc-400">{t('app_detail_confirm_interviewer')}</span> {iv?.name}</p>
                    <p><span className="text-zinc-400">{t('app_detail_confirm_meeting_time')}</span> {meta.meetingTime ? formatMeetingTime(meta.meetingTime) : ''} (UTC+8)</p>
                    <p><span className="text-zinc-400">{t('app_detail_confirm_meeting_link')}</span> <a href={iv?.meetingRoomLink} target="_blank" rel="noreferrer" className="text-indigo-500">{iv?.meetingRoomLink}</a></p>
                    <div className="border-t border-zinc-200 pt-2 mt-2 text-xs text-zinc-500">
                      <p className="font-medium text-zinc-600 mb-1">{t('app_detail_email_preview')}</p>
                      <p>{t('app_detail_email_dear')} {candidate?.name},</p>
                      <p className="mt-1">{t('app_detail_email_invite_body')} <strong>{job?.title}</strong> {t('app_detail_email_invite_body2')}</p>
                      <p className="mt-1"><strong>{t('app_detail_email_time')}</strong> {meta.meetingTime ? formatMeetingTime(meta.meetingTime) : ''} (UTC+8)</p>
                      <p><strong>{t('app_detail_email_meeting_link_label')}</strong> {iv?.meetingRoomLink}</p>
                      <p><strong>{t('app_detail_email_interviewer_label')}</strong> {iv?.name}</p>
                      <p className="mt-1">{t('app_detail_email_footer')}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <p><span className="text-zinc-400">{t('app_detail_cal_title_label')}</span> {t('app_detail_cal_interview_with')} {candidate?.name}</p>
                    <p><span className="text-zinc-400">{t('app_detail_cal_time_label')}</span> {meta.meetingTime ? formatMeetingTime(meta.meetingTime) : ''} (UTC+8)</p>
                    <p><span className="text-zinc-400">{t('app_detail_cal_location')}</span> {iv?.meetingRoomLink}</p>
                    <p><span className="text-zinc-400">{t('app_detail_cal_guest')}</span> {iv?.email}</p>
                    <p><span className="text-zinc-400">{t('app_detail_cal_description')}</span> {t('app_detail_cal_view_resume')} {buildFeedbackUrl(appId!, stageId)}</p>
                  </>
                )}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setConfirmModal(null)}
                  className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-zinc-600 text-sm font-medium hover:bg-zinc-50">
                  {t('app_detail_cancel')}
                </button>
                <button onClick={handleConfirm}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium">
                  {isResend ? (isEmail ? t('app_detail_resend_btn') : t('app_detail_recreate_btn')) : t('app_detail_confirm')}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Stage-Level Send Invite Email Modal ───────────────────── */}
      {stageEmailModal && (() => {
        const { stageId } = stageEmailModal;
        const stageIvIds = application.stageInterviewers?.[stageId] ?? [];
        const handleSendStageEmail = () => {
          const now = new Date().toISOString();
          stageIvIds.forEach(ivId => {
            dispatch({
              type: 'SET_INTERVIEWER_META',
              applicationId: appId!,
              stageId,
              interviewerId: ivId,
              meta: { inviteEmailSent: true, inviteEmailSentAt: now },
            });
          });
          setStageEmailSent(true);
        };
        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
              {stageEmailSent ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-green-700">Email Sent Successfully</h3>
                    <button onClick={() => setStageEmailModal(null)} className="text-zinc-400 hover:text-zinc-700"><X size={20} /></button>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-5 text-sm text-green-700">
                    <Check size={16} className="inline mr-1" />
                    Invite email has been sent to <strong>{candidate?.email}</strong> with interview details for all interviewers.
                  </div>
                  <button
                    onClick={() => setStageEmailModal(null)}
                    className="w-full py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium"
                  >
                    Done
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-zinc-900">Send Invite Email</h3>
                    <button onClick={() => setStageEmailModal(null)} className="text-zinc-400 hover:text-zinc-700"><X size={20} /></button>
                  </div>
                  <div className="bg-zinc-50 rounded-xl p-4 text-sm text-zinc-700 space-y-3 mb-5 border border-zinc-200">
                    <p><span className="text-zinc-400">To:</span> {candidate?.email}</p>
                    <p className="font-medium text-zinc-600">Interview details:</p>
                    <div className="space-y-2">
                      {stageIvIds.map(ivId => {
                        const iv = interviewers.find(i => i.id === ivId);
                        const meta = getMeta(stageId, ivId);
                        return (
                          <div key={ivId} className="bg-white rounded-lg p-2.5 border border-zinc-100">
                            <p className="font-medium text-zinc-700">{iv?.name}</p>
                            <p className="text-xs text-zinc-500">
                              {meta.meetingTime ? `${formatMeetingTime(meta.meetingTime)} (UTC+8)` : 'No time set'}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setStageEmailModal(null)}
                      className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-zinc-600 text-sm font-medium hover:bg-zinc-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSendStageEmail}
                      className="flex-1 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium"
                    >
                      Send Email
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
