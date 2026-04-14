import { apiGet, apiPost } from './client';
import type { Candidate } from '../types';

interface ServerCandidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: Candidate['source'];
  referrer_name?: string;
  resume_path?: string | null;
  resume_filename?: string | null;
  current_company?: string;
  current_title?: string;
  linkedin?: string;
  portfolio?: string;
  createdAt: string;
}

function mapCandidate(c: ServerCandidate): Candidate {
  return {
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    source: c.source,
    referrer_name: c.referrer_name,
    resume_path: c.resume_path ?? undefined,
    current_company: c.current_company,
    current_title: c.current_title,
    linkedin: c.linkedin,
    portfolio: c.portfolio,
  };
}

export async function getCandidates(): Promise<Candidate[]> {
  const data = await apiGet<ServerCandidate[]>('/candidates');
  return data.map(mapCandidate);
}

export async function createCandidate(body: Partial<Candidate>): Promise<Candidate> {
  const data = await apiPost<ServerCandidate>('/candidates', body);
  return mapCandidate(data);
}
