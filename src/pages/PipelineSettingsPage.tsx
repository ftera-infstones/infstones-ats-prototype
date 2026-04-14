import { useState } from 'react';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove, SortableContext, useSortable, verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Plus, X, Check } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useApp } from '../context/AppContext';
import { useLang } from '../context/LangContext';
import type { PipelineStage } from '../types';

interface SortableStageItemProps {
  stage: PipelineStage;
  onDelete: (id: string) => void;
  onUpdate: (id: string, name: string) => void;
  onToggleNeedInterviewer: (id: string, value: boolean) => void;
}

function SortableStageItem({ stage, onDelete, onUpdate, onToggleNeedInterviewer }: SortableStageItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: stage.id });
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(stage.name);

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSave = () => {
    if (editName.trim()) onUpdate(stage.id, editName.trim());
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') { setEditName(stage.name); setEditing(false); }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-xl border border-zinc-200 px-4 py-3 flex items-center gap-3 ${isDragging ? 'shadow-lg' : 'hover:border-zinc-300'}`}
    >
      <button {...attributes} {...listeners} className="text-zinc-300 hover:text-zinc-500 cursor-grab active:cursor-grabbing transition-colors">
        <GripVertical size={18} />
      </button>
      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: stage.color }} />
      <span className="text-xs text-zinc-400 w-5 text-center">{stage.display_order}</span>

      {editing ? (
        <div className="flex items-center gap-2 flex-1">
          <input
            type="text"
            value={editName}
            onChange={e => setEditName(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            className="flex-1 border border-indigo-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button onClick={handleSave} className="text-indigo-500 hover:text-indigo-700"><Check size={16} /></button>
          <button onClick={() => { setEditName(stage.name); setEditing(false); }} className="text-zinc-400 hover:text-zinc-600"><X size={16} /></button>
        </div>
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="flex-1 text-left text-zinc-700 font-medium text-sm hover:text-indigo-600 transition-colors"
        >
          {stage.name}
        </button>
      )}

      {/* Need Interviewer toggle */}
      <label className="flex items-center gap-1.5 cursor-pointer text-xs text-zinc-500 hover:text-zinc-700 flex-shrink-0">
        <input
          type="checkbox"
          checked={stage.needInterviewer}
          onChange={e => onToggleNeedInterviewer(stage.id, e.target.checked)}
          className="accent-indigo-500 w-3.5 h-3.5"
        />
        Need Interviewer
      </label>

      {stage.is_default ? (
        <span className="text-xs text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full" title="Default stages cannot be deleted">Default</span>
      ) : (
        <button onClick={() => onDelete(stage.id)} className="text-zinc-300 hover:text-red-500 transition-colors" title="Delete stage">
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
}

export default function PipelineSettingsPage() {
  const { t } = useLang();
  const { stages, dispatch } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', color: '#6366f1' });

  const sortedStages = [...stages].sort((a, b) => a.display_order - b.display_order);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sortedStages.findIndex(s => s.id === active.id);
    const newIndex = sortedStages.findIndex(s => s.id === over.id);
    const reordered = arrayMove(sortedStages, oldIndex, newIndex);
    dispatch({ type: 'REORDER_STAGES', orderedIds: reordered.map(s => s.id) });
  };

  const presetColors = ['#3b82f6','#eab308','#a855f7','#f97316','#22c55e','#ef4444','#6366f1','#ec4899','#14b8a6','#f59e0b'];

  return (
    <div className="min-h-screen bg-zinc-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">{t('pipeline_title')}</h1>
            <p className="text-zinc-500 text-sm mt-1">{t('pipeline_subtitle')}</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={16} />Add Stage
          </button>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sortedStages.map(s => s.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {sortedStages.map(stage => (
                <SortableStageItem
                  key={stage.id}
                  stage={stage}
                  onDelete={id => dispatch({ type: 'DELETE_STAGE', stageId: id })}
                  onUpdate={(id, name) => dispatch({ type: 'UPDATE_STAGE', stageId: id, name })}
                  onToggleNeedInterviewer={(id, value) => dispatch({ type: 'TOGGLE_STAGE_NEED_INTERVIEWER', stageId: id, value })}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-zinc-900">{t('pipeline_modal_title')}</h2>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-400 hover:text-zinc-700"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-zinc-700 block mb-1.5">{t('pipeline_stage_name_label')}</label>
                <input
                  type="text"
                  value={addForm.name}
                  onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Technical Test"
                  className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-700 block mb-2">{t('pipeline_color_label')}</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {presetColors.map(color => (
                    <button key={color} onClick={() => setAddForm(f => ({ ...f, color }))}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${addForm.color === color ? 'border-zinc-800 scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 rounded-lg border border-zinc-200 text-zinc-600 text-sm font-medium hover:bg-zinc-50">{t('pipeline_cancel')}</button>
              <button
                onClick={() => {
                  if (!addForm.name.trim()) return;
                  const maxOrder = stages.length > 0 ? Math.max(...stages.map(s => s.display_order)) : 0;
                  dispatch({ type: 'ADD_STAGE', stage: { id: `s-${Date.now()}`, name: addForm.name.trim(), color: addForm.color, display_order: maxOrder + 1, is_default: false, needInterviewer: false } });
                  setAddForm({ name: '', color: '#6366f1' });
                  setShowAddModal(false);
                }}
                disabled={!addForm.name.trim()}
                className="flex-1 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-sm font-medium transition-colors"
              >
                Add Stage
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
