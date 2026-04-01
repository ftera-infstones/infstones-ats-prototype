import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { FileText, MessageSquare, Send, Clock } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useApp } from '../context/AppContext';
import type { Comment } from '../mock/data';

export default function ApplicationDetailPage() {
  const { id: appId } = useParams<{ id: string }>();
  const { applications, candidates, jobs, stages, comments, stageHistory, users, currentUser, dispatch } = useApp();
  const [commentText, setCommentText] = useState('');

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
  const appComments = comments.filter(c => c.application_id === appId);
  const appHistory = stageHistory
    .filter(h => h.application_id === appId)
    .sort((a, b) => new Date(a.moved_at).getTime() - new Date(b.moved_at).getTime());

  const handleAddComment = () => {
    if (!commentText.trim() || !currentUser) return;
    const newComment: Comment = {
      id: `cm-${Date.now()}`,
      application_id: appId!,
      user_id: currentUser.id,
      content: commentText.trim(),
      created_at: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_COMMENT', comment: newComment });
    setCommentText('');
  };

  const handleMoveStage = (stageId: string) => {
    if (!currentUser) return;
    dispatch({
      type: 'MOVE_APPLICATION',
      applicationId: appId!,
      newStageId: stageId,
      userId: currentUser.id,
    });
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
      });
    } catch { return iso; }
  };

  const formatDateTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleString('en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
      });
    } catch { return iso; }
  };

  const getUserName = (userId: string) => users.find(u => u.id === userId)?.name ?? 'Unknown';
  const getStageName = (stageId: string | null) => stageId
    ? stages.find(s => s.id === stageId)?.name ?? stageId
    : '—';

  const sourceColors: Record<string, string> = {
    LinkedIn: 'bg-blue-100 text-blue-700',
    Referral: 'bg-purple-100 text-purple-700',
    Website: 'bg-zinc-100 text-zinc-600',
    Other: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <Navbar
        backLink={{ to: `/jobs/${application.job_id}/kanban`, label: job?.title ?? 'Kanban' }}
        title={candidate?.name}
      />

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-5">
            {/* Candidate Info */}
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

            {/* Resume */}
            <div className="bg-white rounded-xl border border-zinc-200 p-5">
              <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-3">Resume</h2>
              {candidate?.resume_path ? (
                <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-lg border border-zinc-200">
                  <FileText size={18} className="text-indigo-500" />
                  <span className="text-zinc-700 text-sm">{candidate.resume_path}</span>
                </div>
              ) : (
                <p className="text-zinc-400 text-sm">No resume attached.</p>
              )}
            </div>

            {/* Stage History */}
            <div className="bg-white rounded-xl border border-zinc-200 p-5">
              <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-4">Stage History</h2>
              {appHistory.length === 0 ? (
                <p className="text-zinc-400 text-sm">No history yet.</p>
              ) : (
                <div className="space-y-3">
                  {appHistory.map((h, i) => (
                    <div key={h.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5" />
                        {i < appHistory.length - 1 && (
                          <div className="w-0.5 h-full bg-zinc-200 mt-1" />
                        )}
                      </div>
                      <div className="pb-3">
                        <p className="text-zinc-700 text-sm">
                          {h.from_stage_id
                            ? <><span className="text-zinc-400">{getStageName(h.from_stage_id)}</span> → <span className="font-medium">{getStageName(h.to_stage_id)}</span></>
                            : <span className="font-medium">Applied → {getStageName(h.to_stage_id)}</span>
                          }
                        </p>
                        <p className="text-zinc-400 text-xs mt-0.5 flex items-center gap-1">
                          <Clock size={11} />
                          {formatDateTime(h.moved_at)} · {getUserName(h.moved_by_user_id)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Comments */}
            <div className="bg-white rounded-xl border border-zinc-200 p-5">
              <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-4 flex items-center gap-2">
                <MessageSquare size={14} />
                Comments ({appComments.length})
              </h2>

              <div className="space-y-4 mb-4">
                {appComments.map(comment => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-zinc-100 text-zinc-600 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                      {getUserName(comment.user_id).split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-zinc-800 text-sm font-medium">{getUserName(comment.user_id)}</span>
                        <span className="text-zinc-400 text-xs">{formatDateTime(comment.created_at)}</span>
                      </div>
                      <p className="text-zinc-600 text-sm leading-relaxed">{comment.content}</p>
                    </div>
                  </div>
                ))}
                {appComments.length === 0 && (
                  <p className="text-zinc-400 text-sm">No comments yet. Be the first to comment.</p>
                )}
              </div>

              {/* Add Comment */}
              <div className="border-t border-zinc-100 pt-4">
                <textarea
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  rows={3}
                  className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleAddComment}
                    disabled={!commentText.trim()}
                    className="flex items-center gap-1.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    <Send size={13} />
                    Comment
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-5">
            {/* Stage Selector */}
            <div className="bg-white rounded-xl border border-zinc-200 p-5">
              <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-3">Move to Stage</h2>
              <div className="space-y-2">
                {sortedStages.map(stage => (
                  <button
                    key={stage.id}
                    onClick={() => handleMoveStage(stage.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                      application.stage_id === stage.id
                        ? 'border-transparent text-white'
                        : 'border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50'
                    }`}
                    style={
                      application.stage_id === stage.id
                        ? { backgroundColor: stage.color, borderColor: stage.color }
                        : {}
                    }
                  >
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: application.stage_id === stage.id ? 'rgba(255,255,255,0.7)' : stage.color }}
                    />
                    {stage.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Application Info */}
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
        </div>
      </div>
    </div>
  );
}
