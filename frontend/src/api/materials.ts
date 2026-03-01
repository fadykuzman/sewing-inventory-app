import { ApiResponse, Material } from '../types/fabric';
import { API_URL } from './fabrics';

export async function getMaterials(): Promise<Material[]> {
  const response = await fetch(`${API_URL}/materials`);
  const json: ApiResponse<Material[]> = await response.json();
  if (!response.ok) throw new Error(json.error ?? 'Failed to fetch materials');
  return json.data!;
}
