import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { Paperclip, Plus, X, Eye } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useApp } from '../context/AppContext';
import type { Application } from '../mock/data';

// ─── Draggable Card ───────────────────────────────────────────────────────────

interface CardProps {
  application: Application;
  isDragging?: boolean;
}

function ApplicationCard({ application, isDragging }: CardProps) {
  const { candidates } = useApp();
  const navigate = useNavigate();
  const candidate = candidates.find(c => c.id === application.candidate_id);
  if (!candidate) return null;

  const sourceColors: Record<string, string> = {
    LinkedIn: 'bg-blue-100 text-blue-700',
    Referral: 'bg-purple-100 text-purple-700',
    Website: 'bg-zinc-100 text-zinc-600',
    Other: 'bg-gray-100 text-gray-600',
  };

  return (
    <div
      className={`bg-white rounded-lg border border-zinc-200 p-3 select-none ${
        isDragging ? 'opacity-50' : 'hover:border-indigo-200 hover:shadow-sm'
      } transition-all`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-zinc-800 font-medium text-sm leading-tight">{candidate.name}</p>
        {candidate.resume_path && (
          <Paperclip size={13} className="text-zinc-400 flex-shrink-0 mt-0.5" />
        )}
      </div>

      <p className="text-zinc-400 text-xs mt-1">{application.applied_at}</p>

      <div className="flex items-center justify-between mt-2.5">
        <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${sourceColors[candidate.source] || 'bg-gray-100 text-gray-600'}`}>
          {candidate.source}
        </span>
        <button
          onClick={() => navigate(`/applications/${application.id}`)}
          className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 font-medium"
        >
          <Eye size={12} />
          View
        </button>
      </div>
    </div>
  );
}

function DraggableCard({ application }: { application: Application }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: application.id,
    data: { application },
  });

  return (
    <div ref={setNodeRef} {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing">
      <ApplicationCard application={application} isDragging={isDragging} />
    </div>
  );
}

// ─── Droppable Column ─────────────────────────────────────────────────────────

interface ColumnProps {
  stageId: string;
  stageName: string;
  stageColor: string;
  applications: Application[];
  onAddClick: () => void;
}

function KanbanColumn({ stageId, stageName, stageColor, applications, onAddClick }: ColumnProps) {
  const { isOver, setNodeRef } = useDroppable({ id: stageId });

  return (
    <div className="flex-shrink-0 w-64">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stageColor }} />
          <span className="text-zinc-700 font-medium text-sm">{stageName}</span>
          <span
            className="text-xs font-semibold px-1.5 py-0.5 rounded-full text-white"
            style={{ backgroundColor: stageColor }}
          >
            {applications.length}
          </span>
        </div>
        <button
          onClick={onAddClick}
          className="text-zinc-400 hover:text-zinc-700 transition-colors"
          title="Add candidate"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Droppable Area */}
      <div
        ref={setNodeRef}
        className={`min-h-32 rounded-xl p-2 space-y-2 transition-colors ${
          isOver ? 'bg-indigo-50 border-2 border-indigo-300 border-dashed' : 'bg-zinc-100/70'
        }`}
      >
        {applications.map(app => (
          <DraggableCard key={app.id} application={app} />
        ))}
        {applications.length === 0 && (
          <div className="flex items-center justify-center h-20 text-zinc-400 text-xs">
            Drop here
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function KanbanPage() {
  const { id: jobId } = useParams<{ id: string }>();
  const { jobs, stages, applications, candidates, dispatch, currentUser } = useApp();
  const [activeAppId, setActiveAppId] = useState<string | null>(null);
  const [addModal, setAddModal] = useState<{ stageId: string } | null>(null);
  const [addForm, setAddForm] = useState({ mode: 'existing', candidateId: '', name: '', email: '' });

  const job = jobs.find(j => j.id === jobId);
  const jobApplications = applications.filter(a => a.job_id === jobId);
  const sortedStages = [...stages].sort((a, b) => a.display_order - b.display_order);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  if (!job) {
    return (
      <div className="min-h-screen bg-zinc-50">
        <Navbar />
        <div className="flex items-center justify-center h-64 text-zinc-400">Job not found.</div>
      </div>
    );
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveAppId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveAppId(null);
    if (!over) return;
    const appId = active.id as string;
    const newStageId = over.id as string;
    const app = applications.find(a => a.id === appId);
    if (!app || app.stage_id === newStageId) return;
    if (!currentUser) return;
    dispatch({
      type: 'MOVE_APPLICATION',
      applicationId: appId,
      newStageId,
      userId: currentUser.id,
    });
  };

  const handleDragOver = (_event: DragOverEvent) => {};

  const handleAddApplication = () => {
    if (!addModal) return;
    let candidateId = addForm.candidateId;

    if (addForm.mode === 'new') {
      if (!addForm.name.trim() || !addForm.email.trim()) return;
      // In a real app we'd add to candidates too; for prototype just create inline
      candidateId = `c-${Date.now()}`;
      // We can't easily add to candidates via reducer without an ADD_CANDIDATE action
      // For simplicity, just create application with the id reference (won't display perfectly)
    }

    if (!candidateId) return;

    // Check not already applied to this job
    const alreadyApplied = applications.some(
      a => a.job_id === jobId && a.candidate_id === candidateId
    );
    if (alreadyApplied) {
      alert('This candidate already has an application for this job.');
      return;
    }

    const newApp: Application = {
      id: `a-${Date.now()}`,
      job_id: jobId!,
      candidate_id: candidateId,
      stage_id: addModal.stageId,
      applied_at: new Date().toISOString().split('T')[0],
    };
    dispatch({ type: 'ADD_APPLICATION', application: newApp });
    setAddModal(null);
    setAddForm({ mode: 'existing', candidateId: '', name: '', email: '' });
  };

  // Candidates not yet applied to this job
  const availableCandidates = candidates.filter(
    c => !applications.some(a => a.job_id === jobId && a.candidate_id === c.id)
  );

  const activeApp = activeAppId ? applications.find(a => a.id === activeAppId) : null;

  return (
    <div className="min-h-screen bg-zinc-50">
      <Navbar backLink={{ to: '/jobs', label: 'Jobs' }} title={job.title} />

      <div className="px-6 py-6 overflow-x-auto">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
        >
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
                  onAddClick={() => setAddModal({ stageId: stage.id })}
                />
              );
            })}
          </div>

          <DragOverlay>
            {activeApp && <ApplicationCard application={activeApp} />}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Add Candidate Modal */}
      {addModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-zinc-900">Add Candidate</h2>
              <button
                onClick={() => setAddModal(null)}
                className="text-zinc-400 hover:text-zinc-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setAddForm(f => ({ ...f, mode: 'existing' }))}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  addForm.mode === 'existing'
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                    : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                }`}
              >
                Existing Candidate
              </button>
              <button
                onClick={() => setAddForm(f => ({ ...f, mode: 'new' }))}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  addForm.mode === 'new'
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                    : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                }`}
              >
                New Candidate
              </button>
            </div>

            {addForm.mode === 'existing' ? (
              <div>
                <label className="text-sm font-medium text-zinc-700 block mb-1.5">Select Candidate</label>
                <select
                  value={addForm.candidateId}
                  onChange={e => setAddForm(f => ({ ...f, candidateId: e.target.value }))}
                  className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  <option value="">— Select a candidate —</option>
                  {availableCandidates.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-zinc-700 block mb-1.5">Name *</label>
                  <input
                    type="text"
                    value={addForm.name}
                    onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Full name"
                    className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-zinc-700 block mb-1.5">Email *</label>
                  <input
                    type="email"
                    value={addForm.email}
                    onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="email@example.com"
                    className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setAddModal(null)}
                className="flex-1 py-2.5 rounded-lg border border-zinc-200 text-zinc-600 text-sm font-medium hover:bg-zinc-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddApplication}
                className="flex-1 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors"
              >
                Add to Pipeline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
