import { useState, useCallback } from 'react';
import { validateCreateFabric } from '@sewing/shared';
import { Fabric } from '../types/fabric';

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

  const populateFromFabric = useCallback((fabric: Fabric) => {
    setFormData({
      type: fabric.type,
      color: fabric.color ?? '',
      pattern: fabric.pattern ?? '',
      amountMeters: String(fabric.amount_meters),
      label: fabric.label ?? '',
      purchaseLocation: fabric.purchase_location ?? '',
      cost: fabric.cost != null ? String(fabric.cost) : '',
      projectIdeas: fabric.project_ideas ?? '',
    });
  }, []);



  function validate(): string[] {
    return validateCreateFabric({
      type: formData.type,
      amount_meters: formData.amountMeters,
      cost: formData.cost || undefined,
      color: formData.color || undefined,
      pattern: formData.pattern || undefined,
      label: formData.label || undefined,
      purchase_location: formData.purchaseLocation || undefined,
      project_ideas: formData.projectIdeas || undefined,
    });
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

  function toJSON(): Record<string, string> {
    const data: Record<string, string> = {
      type: formData.type.trim(),
      amount_meters: formData.amountMeters.trim(),
    };
    if (formData.color) data.color = formData.color.trim();
    if (formData.pattern) data.pattern = formData.pattern.trim();
    if (formData.label) data.label = formData.label.trim();
    if (formData.purchaseLocation) data.purchase_location = formData.purchaseLocation.trim();
    if (formData.cost) data.cost = formData.cost.trim();
    if (formData.projectIdeas) data.project_ideas = formData.projectIdeas.trim();
    return data;
  }

  return { formData, setField, reset, populateFromFabric, validate, toFormData, toJSON };
}
