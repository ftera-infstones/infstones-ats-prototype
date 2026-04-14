import { apiGet, apiPost, apiPatch, apiDelete } from './client';
import type { Interviewer } from '../types';

interface ServerInterviewer {
  id: string;
  name: string;
  email: string;
  jobIds: string[];
  meetingRoomLink: string;
  createdAt: string;
}

function mapInterviewer(i: ServerInterviewer): Interviewer {
  return {
    id: i.id,
    name: i.name,
    email: i.email,
    jobIds: i.jobIds,
    meetingRoomLink: i.meetingRoomLink,
  };
}

export async function getInterviewers(): Promise<Interviewer[]> {
  const data = await apiGet<ServerInterviewer[]>('/interviewers');
  return data.map(mapInterviewer);
}

export async function createInterviewer(body: { name: string; email: string; jobIds?: string[]; meetingRoomLink?: string }): Promise<Interviewer> {
  const data = await apiPost<ServerInterviewer>('/interviewers', body);
  return mapInterviewer(data);
}

export async function updateInterviewer(id: string, body: Partial<{ name: string; email: string; jobIds: string[]; meetingRoomLink: string }>): Promise<Interviewer> {
  const data = await apiPatch<ServerInterviewer>(`/interviewers/${id}`, body);
  return mapInterviewer(data);
}

export async function deleteInterviewer(id: string): Promise<void> {
  await apiDelete(`/interviewers/${id}`);
}
