import { ApiResponse, FabricWithImages } from '../types/fabric';

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1';

export async function getFabrics(): Promise<FabricWithImages[]> {
  const response = await fetch(`${API_URL}/fabrics`);
  const json: ApiResponse<FabricWithImages[]> = await response.json();
  if (!response.ok) throw new Error(json.error ?? 'Failed to fetch fabrics');
  return json.data!;
}

export async function getFabricById(id: string): Promise<FabricWithImages> {
  const response = await fetch(`${API_URL}/fabrics/${id}`);
  const json: ApiResponse<FabricWithImages> = await response.json();
  if (!response.ok) throw new Error(json.error ?? 'Failed to fetch fabric');
  return json.data!;
}

export async function deleteFabric(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/fabrics/${id}`, { method: 'DELETE' });
  const json: ApiResponse<never> = await response.json();
  if (!response.ok) throw new Error(json.error ?? 'Failed to delete fabric');
}

export async function createFabric(formData: FormData): Promise<ApiResponse<FabricWithImages>> {
  const response = await fetch(`${API_URL}/fabrics`, {
    method: 'POST',
    body: formData,
  });

  const json: ApiResponse<FabricWithImages> = await response.json();

  if (!response.ok) {
    const message = json.errors?.join(' ') ?? json.error ?? 'Failed to create fabric';
    throw new Error(message);
  }

  return json;
}
