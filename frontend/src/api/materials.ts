import { ApiResponse, Material } from '../types/fabric';
import { logger } from '../logger';
import { API_URL } from './config';
import { authFetch } from './authFetch';

export async function getMaterials(): Promise<Material[]> {
  const response = await authFetch(`${API_URL}/materials`);
  const json: ApiResponse<Material[]> = await response.json();
  if (!response.ok) {
    logger.error('API error: fetch materials', { status: response.status, error: json.error });
    throw new Error(json.error ?? 'Failed to fetch materials');
  }
  return json.data!;
}
