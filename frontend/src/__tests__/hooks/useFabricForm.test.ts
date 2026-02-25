import { renderHook, act } from '@testing-library/react-native';
import { useFabricForm } from '../../hooks/useFabricForm';

describe('useFabricForm', () => {
  it('initializes with empty fields', () => {
    const { result } = renderHook(() => useFabricForm());
    expect(result.current.formData.type).toBe('');
  });

  it('updates a field', () => {
    const { result } = renderHook(() => useFabricForm());
    act(() => result.current.setField('type', 'Cotton'));
    expect(result.current.formData.type).toBe('Cotton');
  })

  it('validates required fields', () => {
    const { result } = renderHook(() => useFabricForm());
    const errors = result.current.validate();
    expect(errors.length).toBeGreaterThan(0);
  })
})
