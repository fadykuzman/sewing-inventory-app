export const VALIDATION_CONSTANTS = {
  MAX_NAME: 255,
  MAX_SHORT: 100,
  MAX_LONG: 1000,
} as const;

export interface RawFabricInput {
  name?: string;
  fabric_type_id?: string | number;
  color?: string;
  pattern?: string;
  amount_meters?: string | number;
  label?: string;
  purchase_location?: string;
  cost?: string | number;
  project_ideas?: string;
}

const OPTIONAL_SHORT_FIELDS: { field: keyof RawFabricInput; label: string }[] = [
  { field: 'color', label: 'Color' },
  { field: 'pattern', label: 'Pattern' },
  { field: 'label', label: 'Label' },
  { field: 'purchase_location', label: 'Purchase location' },
];

export interface RawMaterialInput {
  material_id?: string | number;
  percentage?: string | number;
}

export function validateMaterialComposition(materials?: RawMaterialInput[]): string[] {
  if (materials == null || materials.length === 0) {
    return [];
  }

  const errors: string[] = [];

  if (materials.length > 3) {
    errors.push('Maximum 3 materials allowed.');
    return errors;
  }

  const seenIds = new Set<number>();

  for (let i = 0; i < materials.length; i++) {
    const m = materials[i];
    const pos = i + 1;

    if (m.material_id == null || m.material_id === '') {
      errors.push(`Material ${pos}: material is required.`);
    } else {
      const id = Number(m.material_id);
      if (isNaN(id) || id <= 0 || !Number.isInteger(id)) {
        errors.push(`Material ${pos}: invalid material ID.`);
      } else if (seenIds.has(id)) {
        errors.push(`Material ${pos}: duplicate material.`);
      } else {
        seenIds.add(id);
      }
    }

    if (m.percentage == null || m.percentage === '') {
      errors.push(`Material ${pos}: percentage is required.`);
    } else {
      const pct = Number(m.percentage);
      if (isNaN(pct) || pct < 1 || pct > 100 || !Number.isInteger(pct)) {
        errors.push(`Material ${pos}: percentage must be a whole number between 1 and 100.`);
      }
    }
  }

  return errors;
}

export function validateCreateFabric(body: RawFabricInput): string[] {
  const errors: string[] = [];

  if (body.name == null || typeof body.name !== 'string' || body.name.trim() === '') {
    errors.push('Name is required.');
  } else if (body.name.trim().length > VALIDATION_CONSTANTS.MAX_NAME) {
    errors.push(`Name must be ${VALIDATION_CONSTANTS.MAX_NAME} characters or less.`);
  }

  if (body.fabric_type_id == null || body.fabric_type_id === '') {
    errors.push('Fabric type is required.');
  } else {
    const id = Number(body.fabric_type_id);
    if (isNaN(id) || id <= 0 || !Number.isInteger(id)) {
      errors.push('Fabric type must be a valid ID.');
    }
  }

  if (body.amount_meters == null || body.amount_meters === '') {
    errors.push('Amount (meters) is required.');
  } else {
    const amount = Number(body.amount_meters);
    if (isNaN(amount) || amount <= 0) {
      errors.push('Amount (meters) must be a positive number.');
    }
  }

  if (body.cost != null && body.cost !== '') {
    const cost = Number(body.cost);
    if (isNaN(cost) || cost < 0) {
      errors.push('Cost must be a non-negative number.');
    }
  }

  for (const { field, label } of OPTIONAL_SHORT_FIELDS) {
    const value = body[field];
    if (typeof value === 'string' && value.trim().length > VALIDATION_CONSTANTS.MAX_SHORT) {
      errors.push(`${label} must be ${VALIDATION_CONSTANTS.MAX_SHORT} characters or less.`);
    }
  }

  if (typeof body.project_ideas === 'string' && body.project_ideas.trim().length > VALIDATION_CONSTANTS.MAX_LONG) {
    errors.push(`Project ideas must be ${VALIDATION_CONSTANTS.MAX_LONG} characters or less.`);
  }

  return errors;
}
