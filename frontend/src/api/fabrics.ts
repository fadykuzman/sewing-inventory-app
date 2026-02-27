import { ApiResponse, FabricWithImages } from '../types/fabric';

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1';
const BASE_URL = API_URL.replace('/api/v1', '');

export function getImageUrl(filePath: string): string {
  const normalizedPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
  return `${BASE_URL}/${normalizedPath}`;
}

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

export async function updateFabric(id: string, data: Record<string, unknown>): Promise<ApiResponse<FabricWithImages>> {
  const response = await fetch(`${API_URL}/fabrics/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const json: ApiResponse<FabricWithImages> = await response.json();

  if (!response.ok) {
    const message = json.errors?.join(' ') ?? json.error ?? 'Failed to update fabric';
    throw new Error(message);
  }

  return json;
}

export async function getFabricsPaginated(limit: number, offset: number, search?: string): Promise<FabricWithImages[]> {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (search) params.set('search', search);
  const response = await fetch(`${API_URL}/fabrics?${params}`);
  const json: ApiResponse<FabricWithImages[]> = await response.json();
  if (!response.ok) throw new Error(json.error ?? 'Failed to fetch fabrics');
  return json.data!;
}
