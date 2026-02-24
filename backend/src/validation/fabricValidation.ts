interface CreateFabricInput {
  type?: string;
  color?: string;
  pattern?: string;
  amount_meters?: string | number;
  label?: string;
  purchase_location?: string;
  cost?: string | number;
  project_ideas?: string;
}

const MAX_SHORT = 100;
const MAX_LONG = 1000;

export function validateCreateFabric(body: CreateFabricInput): string[] {
  const errors: string[] = [];

  // type — required, non-empty, max 100
  if (!body.type || !body.type.trim()) {
    errors.push('Type is required.');
  } else if (body.type.trim().length > MAX_SHORT) {
    errors.push(`Type must be ${MAX_SHORT} characters or less.`);
  }

  // amount_meters — required, positive number
  if (body.amount_meters == null || body.amount_meters === '') {
    errors.push('Amount (meters) is required.');
  } else {
    const amount = Number(body.amount_meters);
    if (isNaN(amount) || amount <= 0) {
      errors.push('Amount (meters) must be a positive number.');
    }
  }

  // cost — optional, but must be non-negative number if provided
  if (body.cost != null && body.cost !== '') {
    const cost = Number(body.cost);
    if (isNaN(cost) || cost < 0) {
      errors.push('Cost must be a non-negative number.');
    }
  }

  // optional string fields — max length
  const optionalShort: { field: keyof CreateFabricInput; label: string }[] = [
    { field: 'color', label: 'Color' },
    { field: 'pattern', label: 'Pattern' },
    { field: 'label', label: 'Label' },
    { field: 'purchase_location', label: 'Purchase location' },
  ];

  for (const { field, label } of optionalShort) {
    const value = body[field];
    if (typeof value === 'string' && value.trim().length > MAX_SHORT) {
      errors.push(`${label} must be ${MAX_SHORT} characters or less.`);
    }
  }

  // project_ideas — optional, max 1000
  if (typeof body.project_ideas === 'string' && body.project_ideas.trim().length > MAX_LONG) {
    errors.push(`Project ideas must be ${MAX_LONG} characters or less.`);
  }

  return errors;
}
