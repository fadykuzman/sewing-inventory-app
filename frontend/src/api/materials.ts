import { ApiResponse, Material } from '../types/fabric';
import { logger } from '../logger';
import { API_URL } from './config';

export async function getMaterials(): Promise<Material[]> {
  const response = await fetch(`${API_URL}/materials`);
  const json: ApiResponse<Material[]> = await response.json();
  if (!response.ok) {
    logger.error('API error: fetch materials', { status: response.status, error: json.error });
    throw new Error(json.error ?? 'Failed to fetch materials');
  }
  return json.data!;
}
