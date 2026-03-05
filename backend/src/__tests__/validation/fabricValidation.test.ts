import { validateCreateFabric } from '@sewing/shared';

describe('validateCreateFabric', () => {
  it('returns error when name is missing', () => {
    const errors = validateCreateFabric({ fabric_type_id: 1, amount_meters: '1.5' } as any);
    expect(errors).toContain('Name is required.');
  });

  it('returns error when fabric_type_id is missing', () => {
    const errors = validateCreateFabric({ name: 'Test', amount_meters: '1.5' } as any);
    expect(errors).toContain('Fabric type is required.');
  });

  it('returns error when amount_meters is missing', () => {
    const errors = validateCreateFabric({ name: 'Test', fabric_type_id: 1 } as any);
    expect(errors).toContain('Amount (meters) is required.');
  });

  it('returns no errors for valid input', () => {
    const errors = validateCreateFabric({ name: 'Test', fabric_type_id: 1, amount_meters: '1.5' } as any);
    expect(errors).toHaveLength(0);
  });
});
