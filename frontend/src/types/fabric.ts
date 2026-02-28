export interface FabricType {
  id: number;
  name: string;
  name_en: string;
  slug_de: string;
  slug_en: string;
  category: string;
  use_case: string;
  fabric_count: number;
}

export interface Fabric {
  id: string;
  fabric_type_id: number;
  fabric_type_name?: string;
  color: string | null;
  pattern: string | null;
  amount_meters: number;
  label: string | null;
  purchase_location: string | null;
  cost: number | null;
  project_ideas: string | null;
  created_at: string;
  updated_at: string;
}

export interface FabricImage {
  id: string;
  fabric_id: string;
  file_path: string;
  order: number;
  created_at: string;
}

export interface CreateFabricInput {
  fabric_type_id: number;
  color?: string;
  pattern?: string;
  amount_meters: number;
  label?: string;
  purchase_location?: string;
  cost?: number;
  project_ideas?: string;
}

export interface FabricWithImages extends Fabric {
  images: FabricImage[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: string[];
  warning?: string;
}
