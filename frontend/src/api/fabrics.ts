const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1';

export async function createFabric(formData: FormData) {
  const response = await fetch(`${API_URL}/fabrics`, {
    method: 'POST',
    body: formData,
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.error ?? 'Failed to create fabric');
  }

  return json;
}
