import { apiGet, apiPost, apiPatch, apiDelete } from './client';
import type { PipelineStage } from '../types';

interface ServerStage {
  id: string;
  name: string;
  color: string;
  display_order: number;
  is_default: boolean;
  needInterviewer: boolean;
}

function mapStage(s: ServerStage): PipelineStage {
  return {
    id: s.id,
    name: s.name,
    color: s.color,
    display_order: s.display_order,
    is_default: s.is_default,
    needInterviewer: s.needInterviewer,
  };
}

export async function getStages(): Promise<PipelineStage[]> {
  const data = await apiGet<ServerStage[]>('/stages');
  return data.map(mapStage);
}

export async function createStage(body: { name: string; color?: string; is_default?: boolean; needInterviewer?: boolean }): Promise<PipelineStage> {
  const data = await apiPost<ServerStage>('/stages', body);
  return mapStage(data);
}

export async function updateStage(id: string, body: Partial<{ name: string; color: string; is_default: boolean; needInterviewer: boolean }>): Promise<PipelineStage> {
  const data = await apiPatch<ServerStage>(`/stages/${id}`, body);
  return mapStage(data);
}

export async function deleteStage(id: string): Promise<void> {
  await apiDelete(`/stages/${id}`);
}

export async function reorderStages(stageIds: string[]): Promise<PipelineStage[]> {
  const data = await apiPatch<ServerStage[]>('/stages/reorder', { stageIds });
  return data.map(mapStage);
}
