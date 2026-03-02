import { ApiResponse, FabricType } from '../types/fabric';
import { logger } from '../logger';
import { API_URL } from './config';

interface GetFabricTypesOptions {
  available?: boolean;
}

export async function getFabricTypes(options?: GetFabricTypesOptions): Promise<FabricType[]> {
  const params = new URLSearchParams();
  if (options?.available !== undefined) {
    params.set('available', String(options.available));
  }
  const query = params.toString();
  const url = `${API_URL}/fabric-types${query ? `?${query}` : ''}`;

  const response = await fetch(url);
  const json: ApiResponse<FabricType[]> = await response.json();
  if (!response.ok) {
    logger.error('API error: fetch fabric types', { status: response.status, error: json.error });
    throw new Error(json.error ?? 'Failed to fetch fabric types');
  }
  return json.data!;
}

export async function patchFabricType(id: number, available: boolean): Promise<FabricType> {
  const response = await fetch(`${API_URL}/fabric-types/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ available }),
  });
  const json: ApiResponse<FabricType> = await response.json();
  if (!response.ok) {
    logger.error('API error: update fabric type', { id, status: response.status, error: json.error });
    throw new Error(json.error ?? 'Failed to update fabric type');
  }
  return json.data!;
}
