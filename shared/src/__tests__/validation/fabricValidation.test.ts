import { validateCreateFabric, VALIDATION_CONSTANTS } from '../../validation/fabricValidation';

describe('validateCreateFabric', () => {
  describe('fabric_type_id field', () => {
    it('returns error when fabric_type_id is missing', () => {
      const errors = validateCreateFabric({ amount_meters: '1.5' });
      expect(errors).toContain('Fabric type is required.');
    });

    it('returns error when fabric_type_id is empty string', () => {
      const errors = validateCreateFabric({ fabric_type_id: '', amount_meters: '1.5' });
      expect(errors).toContain('Fabric type is required.');
    });

    it('returns error when fabric_type_id is not a number', () => {
      const errors = validateCreateFabric({ fabric_type_id: 'abc', amount_meters: '1.5' });
      expect(errors).toContain('Fabric type must be a valid ID.');
    });

    it('returns error when fabric_type_id is zero', () => {
      const errors = validateCreateFabric({ fabric_type_id: 0, amount_meters: '1.5' });
      expect(errors).toContain('Fabric type must be a valid ID.');
    });

    it('returns error when fabric_type_id is negative', () => {
      const errors = validateCreateFabric({ fabric_type_id: -1, amount_meters: '1.5' });
      expect(errors).toContain('Fabric type must be a valid ID.');
    });

    it('returns error when fabric_type_id is a float', () => {
      const errors = validateCreateFabric({ fabric_type_id: 1.5, amount_meters: '1.5' });
      expect(errors).toContain('Fabric type must be a valid ID.');
    });
  });

  describe('amount_meters field', () => {
    it('returns error when amount_meters is missing', () => {
      const errors = validateCreateFabric({ fabric_type_id: 1 });
      expect(errors).toContain('Amount (meters) is required.');
    });

    it('returns error when amount_meters is not a number', () => {
      const errors = validateCreateFabric({ fabric_type_id: 1, amount_meters: 'abc' });
      expect(errors).toContain('Amount (meters) must be a positive number.');
    });

    it('returns error when amount_meters is zero', () => {
      const errors = validateCreateFabric({ fabric_type_id: 1, amount_meters: '0' });
      expect(errors).toContain('Amount (meters) must be a positive number.');
    });

    it('returns error when amount_meters is negative', () => {
      const errors = validateCreateFabric({ fabric_type_id: 1, amount_meters: '-1' });
      expect(errors).toContain('Amount (meters) must be a positive number.');
    });
  });

  describe('cost field', () => {
    it('returns error when cost is negative', () => {
      const errors = validateCreateFabric({ fabric_type_id: 1, amount_meters: '1.5', cost: '-5' });
      expect(errors).toContain('Cost must be a non-negative number.');
    });

    it('returns error when cost is not a number', () => {
      const errors = validateCreateFabric({ fabric_type_id: 1, amount_meters: '1.5', cost: 'abc' });
      expect(errors).toContain('Cost must be a non-negative number.');
    });

    it('allows zero cost', () => {
      const errors = validateCreateFabric({ fabric_type_id: 1, amount_meters: '1.5', cost: '0' });
      expect(errors).not.toContain('Cost must be a non-negative number.');
    });

    it('allows missing cost', () => {
      const errors = validateCreateFabric({ fabric_type_id: 1, amount_meters: '1.5' });
      expect(errors).toHaveLength(0);
    });
  });

  describe('optional string fields max length', () => {
    it('returns error when color exceeds max length', () => {
      const errors = validateCreateFabric({ fabric_type_id: 1, amount_meters: '1.5', color: 'a'.repeat(101) });
      expect(errors).toContain(`Color must be ${VALIDATION_CONSTANTS.MAX_SHORT} characters or less.`);
    });

    it('returns error when pattern exceeds max length', () => {
      const errors = validateCreateFabric({ fabric_type_id: 1, amount_meters: '1.5', pattern: 'a'.repeat(101) });
      expect(errors).toContain(`Pattern must be ${VALIDATION_CONSTANTS.MAX_SHORT} characters or less.`);
    });

    it('returns error when label exceeds max length', () => {
      const errors = validateCreateFabric({ fabric_type_id: 1, amount_meters: '1.5', label: 'a'.repeat(101) });
      expect(errors).toContain(`Label must be ${VALIDATION_CONSTANTS.MAX_SHORT} characters or less.`);
    });

    it('returns error when purchase_location exceeds max length', () => {
      const errors = validateCreateFabric({ fabric_type_id: 1, amount_meters: '1.5', purchase_location: 'a'.repeat(101) });
      expect(errors).toContain(`Purchase location must be ${VALIDATION_CONSTANTS.MAX_SHORT} characters or less.`);
    });

    it('returns error when project_ideas exceeds max length', () => {
      const errors = validateCreateFabric({ fabric_type_id: 1, amount_meters: '1.5', project_ideas: 'a'.repeat(1001) });
      expect(errors).toContain(`Project ideas must be ${VALIDATION_CONSTANTS.MAX_LONG} characters or less.`);
    });
  });

  describe('valid input', () => {
    it('returns no errors for minimal valid input', () => {
      const errors = validateCreateFabric({ fabric_type_id: 1, amount_meters: '2.5' });
      expect(errors).toHaveLength(0);
    });

    it('returns no errors for full valid input', () => {
      const errors = validateCreateFabric({
        fabric_type_id: 1,
        amount_meters: '2.5',
        color: 'Red',
        pattern: 'Striped',
        label: 'FabricCo',
        purchase_location: 'Online',
        cost: '15.99',
        project_ideas: 'Summer dress',
      });
      expect(errors).toHaveLength(0);
    });

    it('accepts numeric values for amount_meters and cost', () => {
      const errors = validateCreateFabric({ fabric_type_id: 1, amount_meters: 2.5, cost: 10 });
      expect(errors).toHaveLength(0);
    });
  });
});
