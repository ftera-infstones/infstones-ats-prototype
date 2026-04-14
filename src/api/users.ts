import { apiGet } from './client';
import type { User } from '../types';

interface ServerUser {
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
    ...(u.role ? { role: u.role } : {}),
  } as User;
}

export async function getUsers(): Promise<User[]> {
  const data = await apiGet<ServerUser[]>('/users');
  return data.map(mapUser);
}
