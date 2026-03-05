import { ApiResponse, FabricType } from '../types/fabric';
import { logger } from '../logger';
import { API_URL } from './config';
import { authFetch } from './authFetch';

interface GetFabricTypesOptions {
  hidden?: boolean;
}

export async function getFabricTypes(options?: GetFabricTypesOptions): Promise<FabricType[]> {
  const params = new URLSearchParams();
  if (options?.hidden !== undefined) {
    params.set('hidden', String(options.hidden));
  }
  const query = params.toString();
  const url = `${API_URL}/fabric-types${query ? `?${query}` : ''}`;

  const response = await authFetch(url);
  const json: ApiResponse<FabricType[]> = await response.json();
  if (!response.ok) {
    logger.error('API error: fetch fabric types', { status: response.status, error: json.error });
    throw new Error(json.error ?? 'Failed to fetch fabric types');
  }
  return json.data!;
}

export async function patchFabricType(id: number, hidden: boolean): Promise<FabricType> {
  const response = await authFetch(`${API_URL}/fabric-types/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hidden }),
  });
  const json: ApiResponse<FabricType> = await response.json();
  if (!response.ok) {
    logger.error('API error: update fabric type', { id, status: response.status, error: json.error });
    throw new Error(json.error ?? 'Failed to update fabric type');
  }
  return json.data!;
}
