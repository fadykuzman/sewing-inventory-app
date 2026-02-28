import { ApiResponse, FabricType } from '../types/fabric';
import { API_URL } from './fabrics';

export async function getFabricTypes(): Promise<FabricType[]> {
  const response = await fetch(`${API_URL}/fabric-types`);
  const json: ApiResponse<FabricType[]> = await response.json();
  if (!response.ok) throw new Error(json.error ?? 'Failed to fetch fabric types');
  return json.data!;
}
