import { useCallback, useRef, useEffect } from 'react';

/**
 * A custom hook for memoizing callbacks that need access to the latest prop values,
 * while avoiding unnecessary re-renders in child components.
 * 
 * @param callback The callback function to memoize
 * @returns A stable callback reference that always uses the latest props
 */
export function useEventCallback<T extends (...args: any[]) => any>(callback: T): T {
  // Keep track of the latest callback
  const callbackRef = useRef<T>(callback);
  
  // Update ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  // Return a stable callback that uses the latest version
  return useCallback(
    ((...args: any[]) => {
      return callbackRef.current(...args);
    }) as T,
    []
  );
}

/**
 * A custom hook for handling form input changes without causing re-renders
 * 
 * @param initialState Initial form state
 * @param onSubmit Form submission handler
 * @returns Form state, handlers, and submission function
 */
export function useEventForm<T extends Record<string, any>>(
  initialState: T,
  onSubmit?: (values: T) => void | Promise<void>
) {
  // Use a ref to store form state to avoid re-renders
  const formStateRef = useRef<T>(initialState);
  
  // Handle input change without re-rendering
  const handleChange = useEventCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Handle special input types
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      formStateRef.current = {
        ...formStateRef.current,
        [name]: checkbox.checked
      };
    } else if (type === 'number' || type === 'range') {
      formStateRef.current = {
        ...formStateRef.current,
        [name]: parseFloat(value)
      };
    } else {
      formStateRef.current = {
        ...formStateRef.current,
        [name]: value
      };
    }
  });
  
  // Set a specific field value
  const setFieldValue = useEventCallback((name: string, value: any) => {
    formStateRef.current = {
      ...formStateRef.current,
      [name]: value
    };
  });
  
  // Get the current form values
  const getFormValues = useEventCallback(() => {
    return formStateRef.current;
  });
  
  // Reset the form to initial state
  const resetForm = useEventCallback(() => {
    formStateRef.current = initialState;
  });
  
  // Handle form submission
  const handleSubmit = useEventCallback((e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (onSubmit) {
      return onSubmit(formStateRef.current);
    }
  });
  
  return {
    handleChange,
    setFieldValue,
    getFormValues,
    resetForm,
    handleSubmit
  };
}

export default useEventCallback;
