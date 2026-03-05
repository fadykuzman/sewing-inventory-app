import { auth } from '../config/firebase';

export async function authFetch(url: string, init?: RequestInit): Promise<Response> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Not authenticated');
  }

  const token = await user.getIdToken();
  const headers = new Headers(init?.headers);
  headers.set('Authorization', `Bearer ${token}`);

  return fetch(url, { ...init, headers });
}
