import { apiGet, apiPost, apiPatch, apiDelete } from './client';
import type { Job } from '../types';

interface ServerJob {
  id: string;
  title: string;
  department: string;
  team?: string;
  location: string;
  commitment: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  description: string;
  responsibilities?: string;
  requirements?: string;
  nice_to_have?: string;
  about_company?: string;
  status: 'open' | 'draft' | 'closed';
  base?: 'US' | 'CHN';
  created_by?: string;
  createdAt: string;
  updatedAt: string;
}

function mapJob(j: ServerJob): Job {
  return {
    id: j.id,
    title: j.title,
    department: j.department,
    team: j.team,
    location: j.location,
    commitment: j.commitment,
    description: j.description,
    responsibilities: j.responsibilities,
    requirements: j.requirements,
    nice_to_have: j.nice_to_have,
    about_company: j.about_company,
    status: j.status,
    base: j.base,
    created_by: j.created_by,
    created_at: j.createdAt,
  };
}

export async function getJobs(): Promise<Job[]> {
  const data = await apiGet<ServerJob[]>('/jobs');
  return data.map(mapJob);
}

export async function createJob(body: Partial<Job>): Promise<Job> {
  const data = await apiPost<ServerJob>('/jobs', body);
  return mapJob(data);
}

export async function updateJob(id: string, body: Partial<Job>): Promise<Job> {
  const data = await apiPatch<ServerJob>(`/jobs/${id}`, body);
  return mapJob(data);
}

export async function updateJobStatus(id: string, status: 'open' | 'draft' | 'closed'): Promise<Job> {
  const data = await apiPatch<ServerJob>(`/jobs/${id}`, { status });
  return mapJob(data);
}

export async function deleteJob(id: string): Promise<void> {
  await apiDelete(`/jobs/${id}`);
}
