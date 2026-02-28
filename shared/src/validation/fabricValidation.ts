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
