import { validateMaterialComposition } from '../../validation/fabricValidation';

describe('validateMaterialComposition', () => {
  describe('optional field', () => {
    it('returns no errors when undefined', () => {
      expect(validateMaterialComposition(undefined)).toHaveLength(0);
    });

    it('returns no errors when empty array', () => {
      expect(validateMaterialComposition([])).toHaveLength(0);
    });
  });

  describe('max 3 materials', () => {
    it('returns error when more than 3 materials', () => {
      const materials = [
        { material_id: 1, percentage: 25 },
        { material_id: 2, percentage: 25 },
        { material_id: 3, percentage: 25 },
        { material_id: 4, percentage: 25 },
      ];
      const errors = validateMaterialComposition(materials);
      expect(errors).toContain('Maximum 3 materials allowed.');
    });

    it('allows exactly 3 materials', () => {
      const materials = [
        { material_id: 1, percentage: 50 },
        { material_id: 2, percentage: 30 },
        { material_id: 3, percentage: 20 },
      ];
      expect(validateMaterialComposition(materials)).toHaveLength(0);
    });
  });

  describe('material_id validation', () => {
    it('returns error when material_id is missing', () => {
      const errors = validateMaterialComposition([{ percentage: 50 }]);
      expect(errors).toContain('Material 1: material is required.');
    });

    it('returns error when material_id is empty string', () => {
      const errors = validateMaterialComposition([{ material_id: '', percentage: 50 }]);
      expect(errors).toContain('Material 1: material is required.');
    });

    it('returns error when material_id is not a number', () => {
      const errors = validateMaterialComposition([{ material_id: 'abc', percentage: 50 }]);
      expect(errors).toContain('Material 1: invalid material ID.');
    });

    it('returns error when material_id is zero', () => {
      const errors = validateMaterialComposition([{ material_id: 0, percentage: 50 }]);
      expect(errors).toContain('Material 1: invalid material ID.');
    });

    it('returns error when material_id is negative', () => {
      const errors = validateMaterialComposition([{ material_id: -1, percentage: 50 }]);
      expect(errors).toContain('Material 1: invalid material ID.');
    });

    it('returns error when material_id is a float', () => {
      const errors = validateMaterialComposition([{ material_id: 1.5, percentage: 50 }]);
      expect(errors).toContain('Material 1: invalid material ID.');
    });
  });

  describe('percentage validation', () => {
    it('returns error when percentage is missing', () => {
      const errors = validateMaterialComposition([{ material_id: 1 }]);
      expect(errors).toContain('Material 1: percentage is required.');
    });

    it('returns error when percentage is empty string', () => {
      const errors = validateMaterialComposition([{ material_id: 1, percentage: '' }]);
      expect(errors).toContain('Material 1: percentage is required.');
    });

    it('returns error when percentage is 0', () => {
      const errors = validateMaterialComposition([{ material_id: 1, percentage: 0 }]);
      expect(errors).toContain('Material 1: percentage must be a whole number between 1 and 100.');
    });

    it('returns error when percentage is over 100', () => {
      const errors = validateMaterialComposition([{ material_id: 1, percentage: 101 }]);
      expect(errors).toContain('Material 1: percentage must be a whole number between 1 and 100.');
    });

    it('returns error when percentage is a float', () => {
      const errors = validateMaterialComposition([{ material_id: 1, percentage: 50.5 }]);
      expect(errors).toContain('Material 1: percentage must be a whole number between 1 and 100.');
    });

    it('returns error when percentage is not a number', () => {
      const errors = validateMaterialComposition([{ material_id: 1, percentage: 'abc' }]);
      expect(errors).toContain('Material 1: percentage must be a whole number between 1 and 100.');
    });

    it('allows percentage of 1', () => {
      expect(validateMaterialComposition([{ material_id: 1, percentage: 1 }])).toHaveLength(0);
    });

    it('allows percentage of 100', () => {
      expect(validateMaterialComposition([{ material_id: 1, percentage: 100 }])).toHaveLength(0);
    });
  });

  describe('duplicate materials', () => {
    it('returns error for duplicate material_id', () => {
      const materials = [
        { material_id: 1, percentage: 50 },
        { material_id: 1, percentage: 30 },
      ];
      const errors = validateMaterialComposition(materials);
      expect(errors).toContain('Material 2: duplicate material.');
    });
  });

  describe('string coercion', () => {
    it('accepts string values for material_id and percentage', () => {
      const errors = validateMaterialComposition([{ material_id: '1', percentage: '50' }]);
      expect(errors).toHaveLength(0);
    });
  });

  describe('multiple errors', () => {
    it('reports errors for each invalid entry', () => {
      const materials = [
        { material_id: 'abc', percentage: 0 },
        { material_id: 2, percentage: 101 },
      ];
      const errors = validateMaterialComposition(materials);
      expect(errors).toContain('Material 1: invalid material ID.');
      expect(errors).toContain('Material 1: percentage must be a whole number between 1 and 100.');
      expect(errors).toContain('Material 2: percentage must be a whole number between 1 and 100.');
    });
  });
});
