import { auth } from '../config/firebase';

let viewerToken: string | null = null;

export function setViewerToken(token: string | null) {
  viewerToken = token;
}

export async function authFetch(url: string, init?: RequestInit): Promise<Response> {
  const user = auth.currentUser;

  if (user) {
    const token = await user.getIdToken();
    const headers = new Headers(init?.headers);
    headers.set('Authorization', `Bearer ${token}`);
    return fetch(url, { ...init, headers });
  }

  if (viewerToken) {
    const separator = url.includes('?') ? '&' : '?';
    const viewerUrl = `${url}${separator}token=${encodeURIComponent(viewerToken)}`;
    return fetch(viewerUrl, init);
  }

  throw new Error('Not authenticated');
}
