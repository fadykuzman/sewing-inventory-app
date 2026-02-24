import { useState, useCallback } from 'react';

interface FabricFormData {
  type: string;
  color: string;
  pattern: string;
  amountMeters: string;
  label: string;
  purchaseLocation: string;
  cost: string;
  projectIdeas: string;
}

const initialFormData: FabricFormData = {
  type: '',
  color: '',
  pattern: '',
  amountMeters: '',
  label: '',
  purchaseLocation: '',
  cost: '',
  projectIdeas: '',
};

export function useFabricForm() {
  const [formData, setFormData] = useState<FabricFormData>(initialFormData);

  const setField = useCallback(<K extends keyof FabricFormData>(field: K, value: FabricFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const reset = useCallback(() => {
    setFormData(initialFormData);
  }, []);

  function validate(): string[] {
    const errors: string[] = [];

    if (!formData.type.trim()) {
      errors.push('Fabric type is required.');
    }
    if (!formData.amountMeters.trim() || isNaN(Number(formData.amountMeters)) || Number(formData.amountMeters) <= 0) {
      errors.push('Amount (meters) is required and must be a positive number.');
    }
    if (formData.cost && (isNaN(Number(formData.cost)) || Number(formData.cost) < 0)) {
      errors.push('Cost must be a non-negative number.');
    }

    return errors;
  }

  function toFormData(): FormData {
    const fd = new FormData();
    fd.append('type', formData.type.trim());
    fd.append('amount_meters', formData.amountMeters.trim());
    if (formData.color) fd.append('color', formData.color.trim());
    if (formData.pattern) fd.append('pattern', formData.pattern.trim());
    if (formData.label) fd.append('label', formData.label.trim());
    if (formData.purchaseLocation) fd.append('purchase_location', formData.purchaseLocation.trim());
    if (formData.cost) fd.append('cost', formData.cost.trim());
    if (formData.projectIdeas) fd.append('project_ideas', formData.projectIdeas.trim());
    return fd;
  }

  return { formData, setField, reset, validate, toFormData };
}
