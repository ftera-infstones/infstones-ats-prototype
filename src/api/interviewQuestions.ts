import { apiGet, apiPost, apiPatch, apiDelete } from './client';
import type { InterviewQuestion } from '../types';

interface ServerQuestion {
  id: string;
  job_id: string;
  stage_id: string;
  question: string;
  display_order: number;
}

function mapQuestion(q: ServerQuestion): InterviewQuestion {
  return {
    id: q.id,
    job_id: q.job_id,
    stage_id: q.stage_id,
    question: q.question,
    display_order: q.display_order,
  };
}

export async function getInterviewQuestions(jobId?: string, stageId?: string): Promise<InterviewQuestion[]> {
  const params = new URLSearchParams();
  if (jobId) params.set('job_id', jobId);
  if (stageId) params.set('stage_id', stageId);
  const query = params.toString() ? `?${params}` : '';
  const data = await apiGet<ServerQuestion[]>(`/interview-questions${query}`);
  return data.map(mapQuestion);
}

export async function createQuestion(body: { job_id: string; stage_id: string; question: string; display_order: number }): Promise<InterviewQuestion> {
  const data = await apiPost<ServerQuestion>('/interview-questions', body);
  return mapQuestion(data);
}

export async function updateQuestion(id: string, body: Partial<{ question: string; display_order: number }>): Promise<InterviewQuestion> {
  const data = await apiPatch<ServerQuestion>(`/interview-questions/${id}`, body);
  return mapQuestion(data);
}

export async function deleteQuestion(id: string): Promise<void> {
  await apiDelete(`/interview-questions/${id}`);
}

export async function reorderQuestions(questionIds: string[]): Promise<void> {
  await apiPatch('/interview-questions/reorder', { questionIds });
}
