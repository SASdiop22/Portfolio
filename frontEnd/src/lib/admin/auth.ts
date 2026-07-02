import { api } from '@/lib/api';

export async function login(email: string, password: string): Promise<void> {
  const { data } = await api.post<{ success: boolean; data: { token: string } }>('/auth/login', {
    email,
    password,
  });
  localStorage.setItem('token', data.data.token);
}

export function logout(): void {
  localStorage.removeItem('token');
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function isAuthenticated(): boolean {
  return !!getToken();
}