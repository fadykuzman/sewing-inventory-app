import { validateCreateFabric } from '@sewing/shared';

describe('validateCreateFabric', () => {
  it('returns error when type is missing', () => {
    const errors = validateCreateFabric({ amount_meters: '1.5' } as any);
    expect(errors).toContain('Type is required.');
  });

  it('returns error when amount_meters is missing', () => {
    const errors = validateCreateFabric({ type: 'cotton' } as any);
    expect(errors).toContain('Amount (meters) is required.');
  });

  it('returns no errors for valid input', () => {
    const errors = validateCreateFabric({ type: 'cotton', amount_meters: '1.5' } as any);
    expect(errors).toHaveLength(0);
  })
})
