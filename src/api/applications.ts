import { apiGet, apiPost, apiPatch, apiPut } from './client';
import type { Application, Comment, StageHistory, RejectInfo, InterviewerAssignmentMeta } from '../types';

interface ServerApplication {
  id: string;
  job_id: string;
  candidate_id: string;
  stage_id: string;
  applied_at: string;
  stageInterviewers?: Record<string, string[]>;
  stageInterviewerMeta?: Record<string, Record<string, InterviewerAssignmentMeta>>;
  stageFeedback?: Record<string, Record<string, { score: number | null; questions: Array<{ question: string; feedback: string; comment?: string }> }>>;
  rejectInfo?: RejectInfo;
}

interface ServerComment {
  id: string;
  application_id: string;
  user_id: string | { id: string; name: string; email: string };
  content: string;
  created_at: string;
}

interface ServerStageHistory {
  id: string;
  application_id: string;
  from_stage_id: string | null;
  to_stage_id: string;
  moved_at: string;
  moved_by_user_id: string | { id: string; name: string; email: string };
}

function mapApplication(a: ServerApplication): Application {
  return {
    id: a.id,
    job_id: typeof a.job_id === 'object' ? (a.job_id as any).id || (a.job_id as any)._id : a.job_id,
    candidate_id: typeof a.candidate_id === 'object' ? (a.candidate_id as any).id || (a.candidate_id as any)._id : a.candidate_id,
    stage_id: a.stage_id,
    applied_at: a.applied_at,
    stageInterviewers: a.stageInterviewers,
    stageInterviewerMeta: a.stageInterviewerMeta,
    stageFeedback: a.stageFeedback,
    rejectInfo: a.rejectInfo,
  };
}

function mapComment(c: ServerComment): Comment {
  const userId = typeof c.user_id === 'object' ? (c.user_id as any).id : c.user_id;
  return {
    id: c.id,
    application_id: c.application_id,
    user_id: userId,
    content: c.content,
    created_at: c.created_at,
  };
}

function mapStageHistory(h: ServerStageHistory): StageHistory {
  const movedBy = typeof h.moved_by_user_id === 'object' ? (h.moved_by_user_id as any).id : h.moved_by_user_id;
  const appId = typeof h.application_id === 'object' ? (h.application_id as any).id : h.application_id;
  return {
    id: h.id,
    application_id: appId,
    from_stage_id: h.from_stage_id,
    to_stage_id: h.to_stage_id,
    moved_at: h.moved_at,
    moved_by_user_id: movedBy,
  };
}

export async function getAllApplications(): Promise<Application[]> {
  const data = await apiGet<ServerApplication[]>('/applications');
  return data.map(mapApplication);
}

export async function getApplications(jobId: string): Promise<Application[]> {
  const data = await apiGet<ServerApplication[]>(`/applications/jobs/${jobId}`);
  return data.map(mapApplication);
}

export async function createApplication(body: { job_id: string; candidate_id: string; stage_id: string }): Promise<Application> {
  const data = await apiPost<ServerApplication>('/applications', body);
  return mapApplication(data);
}

export async function moveApplication(applicationId: string, stageId: string): Promise<Application> {
  const data = await apiPatch<ServerApplication>(`/applications/${applicationId}/stage`, { stage_id: stageId });
  return mapApplication(data);
}

export async function setRejectInfo(applicationId: string, rejectInfo: RejectInfo): Promise<Application> {
  const data = await apiPatch<ServerApplication>(`/applications/${applicationId}/reject`, {
    tag: rejectInfo.tag,
    description: rejectInfo.description,
  });
  return mapApplication(data);
}

export async function getComments(applicationId: string): Promise<Comment[]> {
  const data = await apiGet<ServerComment[]>(`/applications/${applicationId}/comments`);
  return data.map(mapComment);
}

export async function addComment(applicationId: string, content: string): Promise<Comment> {
  const data = await apiPost<ServerComment>(`/applications/${applicationId}/comments`, { content });
  return mapComment(data);
}

export async function getStageHistory(applicationId: string): Promise<StageHistory[]> {
  const data = await apiGet<ServerStageHistory[]>(`/applications/${applicationId}/history`);
  return data.map(mapStageHistory);
}

export async function setStageInterviewers(applicationId: string, stageId: string, interviewerIds: string[]): Promise<Application> {
  const data = await apiPut<ServerApplication>(`/applications/${applicationId}/stage-interviewers/${stageId}`, { interviewerIds });
  return mapApplication(data);
}

export async function setInterviewerMeta(
  applicationId: string,
  stageId: string,
  interviewerId: string,
  meta: Partial<InterviewerAssignmentMeta>
): Promise<Application> {
  const data = await apiPatch<ServerApplication>(
    `/applications/${applicationId}/interviewer-meta/${stageId}/${interviewerId}`,
    meta
  );
  return mapApplication(data);
}
