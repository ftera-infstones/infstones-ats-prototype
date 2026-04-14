import { apiGet, apiPost } from './client';
import type { User } from '../types';

// Server returns role and base too, which mock User interface may not have.
// We map to what the frontend User type expects.
export interface ServerUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'member';
  base: 'US' | 'CHN' | null;
  createdAt: string;
}

function mapUser(u: ServerUser): User {
  const initials = u.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    avatar_initials: initials,
    base: u.base ?? undefined,
    // Store role on the object for use in access control (extend type at runtime)
    ...(u.role ? { role: u.role } : {}),
  } as User;
}

export async function getMe(): Promise<User> {
  const data = await apiGet<ServerUser>('/auth/me');
  return mapUser(data);
}

export async function logout(): Promise<void> {
  await apiPost('/auth/logout');
}
