import { ApiResponse, FabricWithImages } from '../types/fabric';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1';

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
