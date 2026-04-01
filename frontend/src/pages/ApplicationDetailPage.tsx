import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Paperclip, FileText, X, Check, Star, ChevronDown, Pencil } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useApp } from '../context/AppContext';

export default function ApplicationDetailPage() {
  const { id: appId } = useParams<{ id: string }>();
  const {
    applications,
    candidates,
    jobs,
    stages,
    interviewers,
    currentUser,
    dispatch,
  } = useApp();

  // ── Move Stage UI state ─────────────────────────────────────────────────────
  const [moveStageOpen, setMoveStageOpen] = useState(false);
  const [selectedNewStage, setSelectedNewStage] = useState<string | null>(null);

  // ── Stage Interviewer edit state ────────────────────────────────────────────
  const [editingStageId, setEditingStageId] = useState<string | null>(null);
  const [editingInterviewerIds, setEditingInterviewerIds] = useState<string[]>([]);

  // ── Resume drawer state ─────────────────────────────────────────────────────
  const [drawerOpen, setDrawerOpen] = useState(false);

  // ── Feedback stage selector ─────────────────────────────────────────────────
  const [feedbackStageId, setFeedbackStageId] = useState<string | null>(null);

  const application = applications.find(a => a.id === appId);

  if (!application) {
    return (
      <div className="min-h-screen bg-zinc-50">
        <Navbar />
        <div className="flex items-center justify-center h-64 text-zinc-400">Application not found.</div>
      </div>
    );
  }

  const candidate = candidates.find(c => c.id === application.candidate_id);
  const job = jobs.find(j => j.id === application.job_id);
  const currentStage = stages.find(s => s.id === application.stage_id);
  const sortedStages = [...stages].sort((a, b) => a.display_order - b.display_order);

  // Feedback: default to current stage on first render
  const activeFeedbackStageId = feedbackStageId ?? application.stage_id;

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
      });
    } catch { return iso; }
  };

  const sourceColors: Record<string, string> = {
    LinkedIn: 'bg-blue-100 text-blue-700',
    Referral: 'bg-purple-100 text-purple-700',
    Website: 'bg-zinc-100 text-zinc-600',
    Other: 'bg-gray-100 text-gray-600',
  };

  // ── Move Stage handlers ─────────────────────────────────────────────────────
  const handleMoveStageConfirm = () => {
    if (!selectedNewStage || !currentUser) return;
    dispatch({
      type: 'MOVE_APPLICATION',
      applicationId: appId!,
      newStageId: selectedNewStage,
      userId: currentUser.id,
    });
    setMoveStageOpen(false);
    setSelectedNewStage(null);
  };

  const handleMoveStageCancel = () => {
    setMoveStageOpen(false);
    setSelectedNewStage(null);
  };

  // ── Stage Interviewer handlers ──────────────────────────────────────────────
  const openInterviewerEdit = (stageId: string) => {
    const current = application.stageInterviewers?.[stageId] ?? [];
    setEditingStageId(stageId);
    setEditingInterviewerIds([...current]);
  };

  const toggleInterviewer = (ivId: string) => {
    setEditingInterviewerIds(prev =>
      prev.includes(ivId) ? prev.filter(id => id !== ivId) : [...prev, ivId]
    );
  };

  const saveInterviewers = () => {
    if (!editingStageId) return;
    dispatch({
      type: 'UPDATE_STAGE_INTERVIEWERS',
      applicationId: appId!,
      stageId: editingStageId,
      interviewerIds: editingInterviewerIds,
    });
    setEditingStageId(null);
    setEditingInterviewerIds([]);
  };

  const cancelInterviewerEdit = () => {
    setEditingStageId(null);
    setEditingInterviewerIds([]);
  };

  // Interviewers for this job
  const jobInterviewers = interviewers.filter(iv => iv.jobIds.includes(application.job_id));

  const getInterviewerNames = (ids: string[]) =>
    ids.map(id => interviewers.find(iv => iv.id === id)?.name ?? id).join(', ');

  // ── Feedback helpers ────────────────────────────────────────────────────────
  const currentStageOrder = currentStage?.display_order ?? 0;

  const feedbackData = application.stageFeedback?.[activeFeedbackStageId];

  const renderStars = (score: number | null) => {
    if (score === null) {
      return <span className="text-zinc-400 text-sm">No score yet</span>;
    }
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4].map(n => (
          <Star
            key={n}
            size={16}
            className={n <= score ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-200 fill-zinc-200'}
          />
        ))}
        <span className="text-sm text-zinc-500 ml-1.5">{score}/4</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <Navbar
        backLink={{ to: `/jobs/${application.job_id}/kanban`, label: job?.title ?? 'Kanban' }}
        title={candidate?.name}
      />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ═══════════════════════════════════════════════
              LEFT PANEL (1/3): STAGES + APPLICATION INFO
          ════════════════════════════════════════════════ */}
          <div className="space-y-5">

            {/* ── STAGES module ──────────────────────────── */}
            <div className="bg-white rounded-xl border border-zinc-200 p-5">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide">Stages</h2>
                {!moveStageOpen ? (
                  <button
                    onClick={() => {
                      setMoveStageOpen(true);
                      setSelectedNewStage(application.stage_id);
                    }}
                    className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    <ChevronDown size={12} />
                    Move Stage
                  </button>
                ) : (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleMoveStageConfirm}
                      className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
                      title="Confirm"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      onClick={handleMoveStageCancel}
                      className="p-1 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded transition-colors"
                      title="Cancel"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>

              {/* Move stage dropdown (shown when open) */}
              {moveStageOpen && (
                <div className="mb-3">
                  <select
                    value={selectedNewStage ?? ''}
                    onChange={e => setSelectedNewStage(e.target.value)}
                    className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                  >
                    {sortedStages.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name}{s.id === application.stage_id ? ' (current)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Stage list */}
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
                      {/* Stage name row */}
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: stage.color }}
                        />
                        <span className={`text-sm flex-1 ${isCurrent ? 'text-indigo-700 font-semibold' : 'text-zinc-600 font-medium'}`}>
                          {stage.name}
                        </span>
                      </div>

                      {/* Interviewer row */}
                      {isEditing ? (
                        <div className="mt-2 ml-4">
                          {/* Checkbox list */}
                          <div className="border border-zinc-200 rounded-lg divide-y divide-zinc-100 mb-2 max-h-40 overflow-y-auto">
                            {jobInterviewers.length === 0 ? (
                              <div className="px-3 py-2 text-xs text-zinc-400">No interviewers for this job.</div>
                            ) : (
                              jobInterviewers.map(iv => (
                                <label
                                  key={iv.id}
                                  className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-zinc-50 text-xs"
                                >
                                  <input
                                    type="checkbox"
                                    checked={editingInterviewerIds.includes(iv.id)}
                                    onChange={() => toggleInterviewer(iv.id)}
                                    className="accent-indigo-500"
                                  />
                                  {iv.name}
                                </label>
                              ))
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={saveInterviewers}
                              className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium"
                            >
                              <Check size={12} /> Save
                            </button>
                            <span className="text-zinc-300">·</span>
                            <button
                              onClick={cancelInterviewerEdit}
                              className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600"
                            >
                              <X size={12} /> Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-1 ml-4">
                          {assignedIds.length === 0 ? (
                            <button
                              onClick={() => openInterviewerEdit(stage.id)}
                              className="text-xs text-indigo-500 hover:text-indigo-700 font-medium"
                            >
                              ＋ Add Interviewer
                            </button>
                          ) : (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs text-zinc-500">{getInterviewerNames(assignedIds)}</span>
                              <button
                                onClick={() => openInterviewerEdit(stage.id)}
                                className="text-zinc-400 hover:text-indigo-600 transition-colors"
                                title="Edit interviewers"
                              >
                                <Pencil size={11} />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── APPLICATION INFO module ─────────────────── */}
            <div className="bg-white rounded-xl border border-zinc-200 p-5">
              <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-3">Application Info</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-zinc-400 block text-xs mb-0.5">Applied</span>
                  <span className="text-zinc-700">{formatDate(application.applied_at)}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-xs mb-0.5">Current Stage</span>
                  <span
                    className="inline-block text-xs font-semibold px-2 py-1 rounded-full text-white"
                    style={{ backgroundColor: currentStage?.color }}
                  >
                    {currentStage?.name}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-xs mb-0.5">Job</span>
                  <span className="text-zinc-700">{job?.title}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-xs mb-0.5">Department</span>
                  <span className="text-zinc-700">{job?.department}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════
              RIGHT PANEL (2/3): CANDIDATE + RESUME + FEEDBACK
          ════════════════════════════════════════════════ */}
          <div className="lg:col-span-2 space-y-5">

            {/* ── CANDIDATE section ──────────────────────── */}
            <div className="bg-white rounded-xl border border-zinc-200 p-5">
              <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-4">Candidate</h2>
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
                  <span className="text-zinc-400 block text-xs mb-0.5">Phone</span>
                  <span className="text-zinc-700">{candidate?.phone}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-xs mb-0.5">Source</span>
                  <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${sourceColors[candidate?.source ?? ''] ?? ''}`}>
                    {candidate?.source}
                  </span>
                </div>
              </div>
            </div>

            {/* ── RESUME section ─────────────────────────── */}
            <div className="bg-white rounded-xl border border-zinc-200 p-5">
              <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-3">Resume</h2>
              {candidate?.resume_path ? (
                <button
                  onClick={() => setDrawerOpen(true)}
                  className="flex items-center gap-3 p-3 bg-zinc-50 rounded-lg border border-zinc-200 w-full text-left hover:bg-indigo-50 hover:border-indigo-200 transition-colors group"
                >
                  <Paperclip size={16} className="text-indigo-500 flex-shrink-0" />
                  <span className="text-zinc-700 text-sm group-hover:text-indigo-700 transition-colors">
                    {candidate.resume_path}
                  </span>
                </button>
              ) : (
                <p className="text-zinc-400 text-sm">No resume attached.</p>
              )}
            </div>

            {/* ── STAGE FEEDBACK section ─────────────────── */}
            <div className="bg-white rounded-xl border border-zinc-200 p-5">
              <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-4">Stage Feedback</h2>

              {/* Stage pill tabs */}
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
                        isDisabled
                          ? 'border-zinc-100 text-zinc-300 bg-zinc-50 cursor-not-allowed'
                          : isActive
                          ? 'border-transparent text-white'
                          : 'border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50'
                      }`}
                      style={isActive && !isDisabled ? { backgroundColor: stage.color, borderColor: stage.color } : {}}
                    >
                      {stage.name}
                    </button>
                  );
                })}
              </div>

              {/* Feedback content */}
              {feedbackData === undefined ? (
                <p className="text-zinc-400 text-sm">No feedback recorded yet.</p>
              ) : (
                <div className="space-y-5">
                  {/* Score */}
                  <div>
                    <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide block mb-1.5">Score</span>
                    {renderStars(feedbackData.score)}
                  </div>

                  {/* Interview Questions */}
                  <div>
                    <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide block mb-3">Interview Questions</span>
                    {feedbackData.questions.length === 0 ? (
                      <p className="text-zinc-400 text-sm">No feedback recorded yet.</p>
                    ) : (
                      <div className="space-y-4">
                        {feedbackData.questions.map((qa, idx) => (
                          <div key={idx} className="bg-zinc-50 rounded-lg p-4 border border-zinc-100">
                            <p className="text-sm font-semibold text-zinc-800 mb-1.5">{qa.question}</p>
                            <p className="text-sm text-zinc-600 leading-relaxed">{qa.feedback}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          RESUME DRAWER (slides in from right)
      ════════════════════════════════════════════════ */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer panel */}
          <div className="relative bg-white w-full max-w-lg h-full shadow-2xl flex flex-col">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Paperclip size={15} className="text-indigo-500" />
                <span className="text-sm font-medium text-zinc-800">{candidate?.resume_path}</span>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer body — PDF placeholder */}
            <div className="flex-1 bg-zinc-100 flex flex-col items-center justify-center gap-4 p-8">
              <div className="w-20 h-20 rounded-2xl bg-zinc-200 flex items-center justify-center">
                <FileText size={36} className="text-zinc-400" />
              </div>
              <div className="text-center">
                <p className="text-zinc-500 font-medium text-sm mb-1">PDF Preview not available in prototype</p>
                <p className="text-zinc-400 text-xs">{candidate?.resume_path}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
