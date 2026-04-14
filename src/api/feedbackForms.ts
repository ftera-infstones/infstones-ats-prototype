import { apiGet, apiPost, apiPatch, apiDelete, apiPut } from './client';
import type { FeedbackForm, FeedbackFormGroup, FeedbackFormQuestion } from '../types';

interface ServerFeedbackFormGroup {
  id: string;
  name: string;
}

interface ServerFeedbackFormQuestion {
  id: string;
  question: string;
  answer_type: FeedbackFormQuestion['answer_type'];
  display_order: number;
  options?: string[];
  score_min?: number;
  score_max?: number;
  criteria?: Array<{ label: string; description?: string }>;
  code_language?: string;
}

interface ServerFeedbackForm {
  id: string;
  name: string;
  group_id: ServerFeedbackFormGroup | string | null;
  questions: ServerFeedbackFormQuestion[];
}

function mapGroup(g: ServerFeedbackFormGroup): FeedbackFormGroup {
  return { id: g.id, name: g.name };
}

function mapFormQuestion(q: ServerFeedbackFormQuestion): FeedbackFormQuestion {
  return {
    id: q.id,
    question: q.question,
    answer_type: q.answer_type,
    display_order: q.display_order,
    options: q.options,
    score_min: q.score_min,
    score_max: q.score_max,
    // Map server criteria (label/description) to frontend criteria (id/name/description)
    criteria: q.criteria?.map((c, i) => ({
      id: String(i),
      name: c.label,
      description: c.description,
    })),
    code_language: q.code_language,
  };
}

function mapForm(f: ServerFeedbackForm): FeedbackForm {
  const groupId = f.group_id
    ? typeof f.group_id === 'object'
      ? (f.group_id as ServerFeedbackFormGroup).id
      : f.group_id
    : null;
  return {
    id: f.id,
    name: f.name,
    group_id: groupId,
    questions: f.questions.map(mapFormQuestion),
  };
}

export async function getFeedbackFormGroups(): Promise<FeedbackFormGroup[]> {
  const data = await apiGet<ServerFeedbackFormGroup[]>('/feedback-forms/groups');
  return data.map(mapGroup);
}

export async function createGroup(name: string): Promise<FeedbackFormGroup> {
  const data = await apiPost<ServerFeedbackFormGroup>('/feedback-forms/groups', { name });
  return mapGroup(data);
}

export async function updateGroup(id: string, name: string): Promise<FeedbackFormGroup> {
  const data = await apiPatch<ServerFeedbackFormGroup>(`/feedback-forms/groups/${id}`, { name });
  return mapGroup(data);
}

export async function deleteGroup(id: string): Promise<void> {
  await apiDelete(`/feedback-forms/groups/${id}`);
}

export async function getFeedbackForms(): Promise<FeedbackForm[]> {
  const data = await apiGet<ServerFeedbackForm[]>('/feedback-forms');
  return data.map(mapForm);
}

export async function createForm(body: { name: string; group_id?: string | null; questions?: FeedbackFormQuestion[] }): Promise<FeedbackForm> {
  const data = await apiPost<ServerFeedbackForm>('/feedback-forms', body);
  return mapForm(data);
}

export async function updateForm(id: string, body: Partial<{ name: string; group_id: string | null }>): Promise<FeedbackForm> {
  const data = await apiPatch<ServerFeedbackForm>(`/feedback-forms/${id}`, body);
  return mapForm(data);
}

export async function deleteForm(id: string): Promise<void> {
  await apiDelete(`/feedback-forms/${id}`);
}

export async function updateFormQuestions(id: string, questions: FeedbackFormQuestion[]): Promise<FeedbackForm> {
  // Map frontend criteria back to server format (label/description)
  const serverQuestions = questions.map((q) => ({
    ...q,
    criteria: q.criteria?.map((c) => ({ label: c.name, description: c.description })),
  }));
  const data = await apiPut<ServerFeedbackForm>(`/feedback-forms/${id}/questions`, { questions: serverQuestions });
  return mapForm(data);
}
