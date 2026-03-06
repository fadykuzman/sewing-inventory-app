import { API_URL } from './config';
import { authFetch } from './authFetch';

export async function createInvite(): Promise<string> {
  const response = await authFetch(`${API_URL}/invite`, { method: 'POST' });
  const json = await response.json();
  return json.data.token;
}
