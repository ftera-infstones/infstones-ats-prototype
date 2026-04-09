import { useState } from 'react';
import { Plus, ChevronDown, ChevronRight, Trash2, GripVertical, ArrowUp, ArrowDown, FolderInput } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useApp } from '../context/AppContext';
import type { FeedbackForm, FeedbackFormQuestion, FeedbackQuestionType, ScorecardCriterion } from '../mock/data';
import { FEEDBACK_QUESTION_TYPE_META } from '../mock/data';

const CODE_LANGUAGES = ['JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'C++', 'SQL', 'Other'];

const QUESTION_TYPES = Object.entries(FEEDBACK_QUESTION_TYPE_META) as [FeedbackQuestionType, { label: string; icon: string }][];

export default function FeedbackFormsPage() {
  const { feedbackForms, feedbackFormGroups, dispatch } = useApp();
  const [selectedFormId, setSelectedFormId] = useState<string | null>(feedbackForms[0]?.id ?? null);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingGroupName, setEditingGroupName] = useState('');
  const [editingFormName, setEditingFormName] = useState<string | null>(null);
  const [formNameDraft, setFormNameDraft] = useState('');
  const [showNewFormModal, setShowNewFormModal] = useState(false);
  const [newFormGroupId, setNewFormGroupId] = useState<string>('');
  const [moveFormId, setMoveFormId] = useState<string | null>(null);
  const [moveTargetGroupId, setMoveTargetGroupId] = useState<string>('');

  const selectedForm = feedbackForms.find(f => f.id === selectedFormId) ?? null;

  const toggleGroup = (gId: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      next.has(gId) ? next.delete(gId) : next.add(gId);
      return next;
    });
  };

  const addGroup = () => {
    const id = `fg-${Date.now()}`;
    dispatch({ type: 'ADD_FEEDBACK_FORM_GROUP', group: { id, name: 'New Group' } });
    setEditingGroupId(id);
    setEditingGroupName('New Group');
  };

  const openNewFormModal = () => {
    setNewFormGroupId(feedbackFormGroups[0]?.id ?? '');
    setShowNewFormModal(true);
  };

  const confirmNewForm = () => {
    setShowNewFormModal(false);
    addForm(newFormGroupId || null);
  };

  const openMoveFormModal = (formId: string, currentGroupId: string | null) => {
    setMoveFormId(formId);
    setMoveTargetGroupId(currentGroupId ?? '');
  };

  const confirmMoveForm = () => {
    if (!moveFormId) return;
    const form = feedbackForms.find(f => f.id === moveFormId);
    if (!form) return;
    dispatch({ type: 'UPDATE_FEEDBACK_FORM', form: { ...form, group_id: moveTargetGroupId || null } });
    setMoveFormId(null);
  };

  const addForm = (groupId: string | null) => {
    const id = `ff-${Date.now()}`;
    const form: FeedbackForm = { id, name: 'New Form', group_id: groupId, questions: [] };
    dispatch({ type: 'ADD_FEEDBACK_FORM', form });
    setSelectedFormId(id);
    setEditingFormName(id);
    setFormNameDraft('New Form');
  };

  const saveGroupName = () => {
    if (editingGroupId && editingGroupName.trim()) {
      dispatch({ type: 'UPDATE_FEEDBACK_FORM_GROUP', group: { id: editingGroupId, name: editingGroupName.trim() } });
    }
    setEditingGroupId(null);
  };

  const deleteGroup = (gId: string) => {
    dispatch({ type: 'DELETE_FEEDBACK_FORM_GROUP', groupId: gId });
  };

  const deleteForm = (fId: string) => {
    dispatch({ type: 'DELETE_FEEDBACK_FORM', formId: fId });
    if (selectedFormId === fId) setSelectedFormId(null);
  };

  // --- Right panel: form editor ---
  const updateFormName = (name: string) => {
    if (!selectedForm) return;
    dispatch({ type: 'UPDATE_FEEDBACK_FORM', form: { ...selectedForm, name } });
    setEditingFormName(null);
  };

  const updateQuestions = (questions: FeedbackFormQuestion[]) => {
    if (!selectedForm) return;
    dispatch({ type: 'UPDATE_FEEDBACK_FORM_QUESTIONS', formId: selectedForm.id, questions });
  };

  const addQuestion = () => {
    if (!selectedForm) return;
    const maxOrder = selectedForm.questions.reduce((m, q) => Math.max(m, q.display_order), 0);
    const newQ: FeedbackFormQuestion = {
      id: `fq-${Date.now()}`,
      question: '',
      answer_type: 'text_single',
      display_order: maxOrder + 1,
    };
    updateQuestions([...selectedForm.questions, newQ]);
  };

  const updateQuestion = (qId: string, patch: Partial<FeedbackFormQuestion>) => {
    if (!selectedForm) return;
    updateQuestions(selectedForm.questions.map(q => q.id === qId ? { ...q, ...patch } : q));
  };

  const deleteQuestion = (qId: string) => {
    if (!selectedForm) return;
    const remaining = selectedForm.questions.filter(q => q.id !== qId);
    updateQuestions(remaining.map((q, i) => ({ ...q, display_order: i + 1 })));
  };

  const moveQuestion = (qId: string, direction: 'up' | 'down') => {
    if (!selectedForm) return;
    const sorted = [...selectedForm.questions].sort((a, b) => a.display_order - b.display_order);
    const idx = sorted.findIndex(q => q.id === qId);
    if (direction === 'up' && idx > 0) {
      [sorted[idx - 1], sorted[idx]] = [sorted[idx], sorted[idx - 1]];
    } else if (direction === 'down' && idx < sorted.length - 1) {
      [sorted[idx], sorted[idx + 1]] = [sorted[idx + 1], sorted[idx]];
    }
    updateQuestions(sorted.map((q, i) => ({ ...q, display_order: i + 1 })));
  };

  const ungroupedForms = feedbackForms.filter(f => !f.group_id);
  const sortedQuestions = selectedForm ? [...selectedForm.questions].sort((a, b) => a.display_order - b.display_order) : [];

  return (
    <div className="min-h-screen bg-zinc-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-zinc-900">Feedback Forms</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Manage feedback form templates organized by group. Interviewers use these forms to submit structured feedback.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ minHeight: '70vh' }}>
          {/* ═══ LEFT PANEL: Group/Form tree ═══ */}
          <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden flex flex-col">
            {/* Top buttons */}
            <div className="p-3 border-b border-zinc-100 flex gap-2">
              <button
                onClick={openNewFormModal}
                className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold py-2 rounded-lg transition-colors"
              >
                <Plus size={13} /> New Form
              </button>
              <button
                onClick={addGroup}
                className="flex-1 flex items-center justify-center gap-1.5 border border-indigo-500 text-indigo-600 hover:bg-indigo-50 text-xs font-semibold py-2 rounded-lg transition-colors"
              >
                <Plus size={13} /> New Group
              </button>
            </div>

            {/* Tree */}
            <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
              {feedbackFormGroups.map(group => {
                const isCollapsed = collapsedGroups.has(group.id);
                const groupForms = feedbackForms.filter(f => f.group_id === group.id);
                return (
                  <div key={group.id}>
                    <div className="flex items-center gap-1 px-2 py-2 rounded-lg hover:bg-zinc-50 group cursor-pointer">
                      <button onClick={() => toggleGroup(group.id)} className="text-zinc-400 flex-shrink-0">
                        {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                      </button>
                      {editingGroupId === group.id ? (
                        <input
                          value={editingGroupName}
                          onChange={e => setEditingGroupName(e.target.value)}
                          onBlur={saveGroupName}
                          onKeyDown={e => e.key === 'Enter' && saveGroupName()}
                          className="flex-1 text-xs font-bold uppercase text-zinc-700 border border-indigo-300 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                          autoFocus
                        />
                      ) : (
                        <span
                          className="flex-1 text-xs font-bold uppercase text-zinc-500 tracking-wide"
                          onDoubleClick={() => { setEditingGroupId(group.id); setEditingGroupName(group.name); }}
                        >
                          {group.name}
                        </span>
                      )}
                      <span className="text-[10px] text-zinc-300 mr-1">{groupForms.length}</span>
                      <button
                        onClick={e => { e.stopPropagation(); addForm(group.id); }}
                        className="text-zinc-300 hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Add form to group"
                      >
                        <Plus size={12} />
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); deleteGroup(group.id); }}
                        className="text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete group"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                    {!isCollapsed && groupForms.map(form => (
                      <div
                        key={form.id}
                        onClick={() => setSelectedFormId(form.id)}
                        className={`flex items-center gap-2 pl-8 pr-2 py-2 rounded-lg cursor-pointer group transition-colors ${
                          selectedFormId === form.id ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-zinc-50 border border-transparent'
                        }`}
                      >
                        <span className={`flex-1 text-xs truncate ${selectedFormId === form.id ? 'text-indigo-700 font-semibold' : 'text-zinc-600'}`}>
                          {form.name}
                        </span>
                        <button
                          onClick={e => { e.stopPropagation(); openMoveFormModal(form.id, form.group_id); }}
                          className="text-zinc-300 hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                          title="Move to group"
                        >
                          <FolderInput size={11} />
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); deleteForm(form.id); }}
                          className="text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                );
              })}

              {/* Ungrouped forms */}
              {ungroupedForms.length > 0 && (
                <div className="mt-2 pt-2 border-t border-zinc-100">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase text-zinc-400 tracking-wide">Ungrouped</div>
                  {ungroupedForms.map(form => (
                    <div
                      key={form.id}
                      onClick={() => setSelectedFormId(form.id)}
                      className={`flex items-center gap-2 pl-4 pr-2 py-2 rounded-lg cursor-pointer group transition-colors ${
                        selectedFormId === form.id ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-zinc-50 border border-transparent'
                      }`}
                    >
                      <span className={`flex-1 text-xs truncate ${selectedFormId === form.id ? 'text-indigo-700 font-semibold' : 'text-zinc-600'}`}>
                        {form.name}
                      </span>
                      <button
                        onClick={e => { e.stopPropagation(); openMoveFormModal(form.id, form.group_id); }}
                        className="text-zinc-300 hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                        title="Move to group"
                      >
                        <FolderInput size={11} />
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); deleteForm(form.id); }}
                        className="text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ═══ RIGHT PANEL: Form editor ═══ */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-zinc-200 overflow-hidden flex flex-col">
            {selectedForm ? (
              <>
                {/* Form header */}
                <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
                  <div className="flex-1 mr-4">
                    {editingFormName === selectedForm.id ? (
                      <input
                        value={formNameDraft}
                        onChange={e => setFormNameDraft(e.target.value)}
                        onBlur={() => { if (formNameDraft.trim()) updateFormName(formNameDraft.trim()); else setEditingFormName(null); }}
                        onKeyDown={e => { if (e.key === 'Enter' && formNameDraft.trim()) updateFormName(formNameDraft.trim()); }}
                        className="text-lg font-bold text-zinc-900 border border-indigo-300 rounded-lg px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        autoFocus
                      />
                    ) : (
                      <h2
                        className="text-lg font-bold text-zinc-900 cursor-pointer hover:text-indigo-700 transition-colors"
                        onClick={() => { setEditingFormName(selectedForm.id); setFormNameDraft(selectedForm.name); }}
                      >
                        {selectedForm.name}
                      </h2>
                    )}
                    {selectedForm.group_id && (
                      <span className="text-xs text-zinc-400">
                        {feedbackFormGroups.find(g => g.id === selectedForm.group_id)?.name}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-zinc-400 flex-shrink-0">{sortedQuestions.length} question{sortedQuestions.length !== 1 ? 's' : ''}</span>
                </div>

                {/* Questions list */}
                <div className="flex-1 overflow-y-auto">
                  {sortedQuestions.length === 0 ? (
                    <div className="px-5 py-12 text-center text-zinc-400 text-sm">
                      No questions yet. Click "+ ADD ANOTHER QUESTION" below to get started.
                    </div>
                  ) : (
                    <div className="divide-y divide-zinc-100">
                      {sortedQuestions.map((q, idx) => (
                        <div key={q.id} className="flex items-start gap-3 px-5 py-3.5 group hover:bg-zinc-50/50">
                          <div className="flex flex-col items-center gap-0.5 pt-2 flex-shrink-0">
                            <GripVertical size={14} className="text-zinc-300 cursor-grab" />
                            <button
                              onClick={() => moveQuestion(q.id, 'up')}
                              disabled={idx === 0}
                              className="text-zinc-300 hover:text-zinc-500 disabled:opacity-30"
                            >
                              <ArrowUp size={11} />
                            </button>
                            <button
                              onClick={() => moveQuestion(q.id, 'down')}
                              disabled={idx === sortedQuestions.length - 1}
                              className="text-zinc-300 hover:text-zinc-500 disabled:opacity-30"
                            >
                              <ArrowDown size={11} />
                            </button>
                          </div>
                          <span className="text-zinc-400 text-xs w-5 flex-shrink-0 pt-2.5">{q.display_order}.</span>
                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              value={q.question}
                              onChange={e => updateQuestion(q.id, { question: e.target.value })}
                              placeholder="Enter question text..."
                              className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                            />
                            <div className="flex items-center gap-2">
                              <select
                                value={q.answer_type}
                                onChange={e => {
                                  const newType = e.target.value as FeedbackQuestionType;
                                  const cleared: Partial<FeedbackFormQuestion> = {
                                    answer_type: newType,
                                    options: undefined,
                                    score_min: undefined,
                                    score_max: undefined,
                                    criteria: undefined,
                                    code_language: undefined,
                                  };
                                  if (newType === 'score') {
                                    cleared.score_min = 1;
                                    cleared.score_max = 10;
                                  }
                                  updateQuestion(q.id, cleared);
                                }}
                                className="border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                              >
                                {QUESTION_TYPES.map(([type, meta]) => (
                                  <option key={type} value={type}>{meta.icon} {meta.label}</option>
                                ))}
                              </select>
                            </div>

                            {/* Type-specific config */}
                            {(['dropdown', 'multiple_choice', 'checkboxes'] as FeedbackQuestionType[]).includes(q.answer_type) && (
                              <div className="space-y-1.5">
                                <span className="text-xs font-medium text-zinc-500">Options</span>
                                {(q.options ?? []).map((opt, oi) => (
                                  <div key={oi} className="flex items-center gap-1.5">
                                    <input
                                      type="text"
                                      value={opt}
                                      onChange={e => {
                                        const next = [...(q.options ?? [])];
                                        next[oi] = e.target.value;
                                        updateQuestion(q.id, { options: next });
                                      }}
                                      placeholder={`Option ${oi + 1}`}
                                      className="flex-1 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
                                    />
                                    <button
                                      onClick={() => {
                                        const next = (q.options ?? []).filter((_, i) => i !== oi);
                                        updateQuestion(q.id, { options: next });
                                      }}
                                      className="text-zinc-300 hover:text-red-500 text-xs px-1"
                                    >✕</button>
                                  </div>
                                ))}
                                <button
                                  onClick={() => updateQuestion(q.id, { options: [...(q.options ?? []), ''] })}
                                  className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                                >+ Add option</button>
                              </div>
                            )}

                            {q.answer_type === 'score' && (
                              <div className="flex items-center gap-3">
                                <label className="flex items-center gap-1.5 text-xs text-zinc-500">
                                  Min:
                                  <input
                                    type="number"
                                    value={q.score_min ?? 1}
                                    onChange={e => updateQuestion(q.id, { score_min: Number(e.target.value) })}
                                    className="w-16 border border-zinc-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
                                  />
                                </label>
                                <label className="flex items-center gap-1.5 text-xs text-zinc-500">
                                  Max:
                                  <input
                                    type="number"
                                    value={q.score_max ?? 10}
                                    onChange={e => updateQuestion(q.id, { score_max: Number(e.target.value) })}
                                    className="w-16 border border-zinc-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
                                  />
                                </label>
                              </div>
                            )}

                            {q.answer_type === 'scorecard' && (
                              <div className="space-y-1.5">
                                <span className="text-xs font-medium text-zinc-500">Criteria</span>
                                {(q.criteria ?? []).map((c) => (
                                  <div key={c.id} className="flex items-center gap-1.5">
                                    <input
                                      type="text"
                                      value={c.name}
                                      onChange={e => {
                                        const next = (q.criteria ?? []).map(cr => cr.id === c.id ? { ...cr, name: e.target.value } : cr);
                                        updateQuestion(q.id, { criteria: next });
                                      }}
                                      placeholder="Criterion name"
                                      className="flex-1 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
                                    />
                                    <input
                                      type="text"
                                      value={c.description ?? ''}
                                      onChange={e => {
                                        const next = (q.criteria ?? []).map(cr => cr.id === c.id ? { ...cr, description: e.target.value } : cr);
                                        updateQuestion(q.id, { criteria: next });
                                      }}
                                      placeholder="Description (optional)"
                                      className="flex-1 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
                                    />
                                    <button
                                      onClick={() => {
                                        const next = (q.criteria ?? []).filter(cr => cr.id !== c.id);
                                        updateQuestion(q.id, { criteria: next });
                                      }}
                                      className="text-zinc-300 hover:text-red-500 text-xs px-1"
                                    >✕</button>
                                  </div>
                                ))}
                                <button
                                  onClick={() => {
                                    const newCriterion: ScorecardCriterion = { id: `sc-${Date.now()}`, name: '', description: '' };
                                    updateQuestion(q.id, { criteria: [...(q.criteria ?? []), newCriterion] });
                                  }}
                                  className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                                >+ Add criterion</button>
                              </div>
                            )}

                            {q.answer_type === 'code' && (
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs text-zinc-500">Language:</span>
                                <select
                                  value={q.code_language ?? ''}
                                  onChange={e => updateQuestion(q.id, { code_language: e.target.value })}
                                  className="border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                                >
                                  <option value="">Select language...</option>
                                  {CODE_LANGUAGES.map(lang => (
                                    <option key={lang} value={lang}>{lang}</option>
                                  ))}
                                </select>
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => deleteQuestion(q.id)}
                            className="text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity pt-2 flex-shrink-0"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add question button */}
                  <div className="px-5 py-4 border-t border-zinc-100">
                    <button
                      onClick={addQuestion}
                      className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                    >
                      <Plus size={15} /> Add Another Question
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-zinc-400">
                  <p className="text-sm">Select a form from the left panel to edit</p>
                  <p className="text-xs mt-1">or create a new one</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ Move Form to Group Modal ═══ */}
      {moveFormId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setMoveFormId(null)}>
          <div className="bg-white rounded-xl shadow-xl p-6 w-80" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-zinc-900 mb-1">Move to Group</h3>
            <p className="text-xs text-zinc-400 mb-4">
              {feedbackForms.find(f => f.id === moveFormId)?.name}
            </p>
            <div className="mb-4">
              <label className="block text-xs text-zinc-500 mb-1.5">Target Group</label>
              <select
                value={moveTargetGroupId}
                onChange={e => setMoveTargetGroupId(e.target.value)}
                className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="">No group (Ungrouped)</option>
                {feedbackFormGroups.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setMoveFormId(null)}
                className="px-4 py-2 text-sm text-zinc-600 hover:text-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmMoveForm}
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                Move
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ New Form Modal ═══ */}
      {showNewFormModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowNewFormModal(false)}>
          <div className="bg-white rounded-xl shadow-xl p-6 w-80" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-zinc-900 mb-4">New Form</h3>
            <div className="mb-4">
              <label className="block text-xs text-zinc-500 mb-1.5">Group</label>
              <select
                value={newFormGroupId}
                onChange={e => setNewFormGroupId(e.target.value)}
                className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="">No group (Ungrouped)</option>
                {feedbackFormGroups.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowNewFormModal(false)}
                className="px-4 py-2 text-sm text-zinc-600 hover:text-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmNewForm}
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
