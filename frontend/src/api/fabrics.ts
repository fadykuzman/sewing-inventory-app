import { ApiResponse, FabricImage, FabricWithImages } from '../types/fabric';
import { logger } from '../logger';
import { API_URL } from './config';

const BASE_URL = API_URL.replace('/api/v1', '');

export function getImageUrl(filePath: string): string {
  const normalizedPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
  return `${BASE_URL}/${normalizedPath}`;
}

export async function getFabrics(): Promise<FabricWithImages[]> {
  const response = await fetch(`${API_URL}/fabrics`);
  const json: ApiResponse<FabricWithImages[]> = await response.json();
  if (!response.ok) {
    logger.error('API error: fetch fabrics', { status: response.status, error: json.error });
    throw new Error(json.error ?? 'Failed to fetch fabrics');
  }
  return json.data!;
}

export async function getFabricById(id: string): Promise<FabricWithImages> {
  const response = await fetch(`${API_URL}/fabrics/${id}`);
  const json: ApiResponse<FabricWithImages> = await response.json();
  if (!response.ok) {
    logger.error('API error: fetch fabric', { id, status: response.status, error: json.error });
    throw new Error(json.error ?? 'Failed to fetch fabric');
  }
  return json.data!;
}

export async function deleteFabric(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/fabrics/${id}`, { method: 'DELETE' });
  const json: ApiResponse<never> = await response.json();
  if (!response.ok) {
    logger.error('API error: delete fabric', { id, status: response.status, error: json.error });
    throw new Error(json.error ?? 'Failed to delete fabric');
  }
}

export async function createFabric(formData: FormData): Promise<ApiResponse<FabricWithImages>> {
  const response = await fetch(`${API_URL}/fabrics`, {
    method: 'POST',
    body: formData,
  });

  const json: ApiResponse<FabricWithImages> = await response.json();

  if (!response.ok) {
    const message = json.errors?.join(' ') ?? json.error ?? 'Failed to create fabric';
    logger.error('API error: create fabric', { status: response.status, error: message });
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
    logger.error('API error: update fabric', { id, status: response.status, error: message });
    throw new Error(message);
  }

  return json;
}

export async function addFabricImages(fabricId: string, formData: FormData): Promise<ApiResponse<FabricImage[]>> {
  const response = await fetch(`${API_URL}/fabrics/${fabricId}/images`, {
    method: 'POST',
    body: formData,
  });

  const json: ApiResponse<FabricImage[]> = await response.json();

  if (!response.ok) {
    logger.error('API error: add images', { fabricId, status: response.status, error: json.error });
    throw new Error(json.error ?? 'Failed to upload images');
  }

  return json;
}

export async function removeFabricImages(fabricId: string, imageIds: string[]): Promise<void> {
  const response = await fetch(`${API_URL}/fabrics/${fabricId}/images`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageIds }),
  });

  const json: ApiResponse<never> = await response.json();
  if (!response.ok) {
    logger.error('API error: remove images', { fabricId, imageIds, status: response.status, error: json.error });
    throw new Error(json.error ?? 'Failed to remove images');
  }
}

export async function getFabricsPaginated(limit: number, offset: number, search?: string, fabricTypeId?: number): Promise<FabricWithImages[]> {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (search) params.set('search', search);
  if (fabricTypeId) params.set('fabric_type_id', String(fabricTypeId));
  const response = await fetch(`${API_URL}/fabrics?${params}`);
  const json: ApiResponse<FabricWithImages[]> = await response.json();
  if (!response.ok) {
    logger.error('API error: fetch fabrics paginated', { status: response.status, error: json.error });
    throw new Error(json.error ?? 'Failed to fetch fabrics');
  }
  return json.data!;
}
