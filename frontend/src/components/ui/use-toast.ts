import { useState, useCallback } from 'react';

export interface ToastData {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
}

let toastIdCounter = 0;
const listeners = new Set<(toasts: ToastData[]) => void>();
let toasts: ToastData[] = [];

function addToast(toast: Omit<ToastData, 'id'>) {
  const id = `toast-${++toastIdCounter}`;
  const newToast = { ...toast, id };
  toasts = [...toasts, newToast];
  listeners.forEach((listener) => listener(toasts));

  // Auto-remove after 5 seconds
  setTimeout(() => {
    removeToast(id);
  }, 5000);

  return id;
}

function removeToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  listeners.forEach((listener) => listener(toasts));
}

export function useToast() {
  const [state, setState] = useState<ToastData[]>(toasts);

  // Keep state in sync
  if (!listeners.has(setState)) {
    listeners.add(setState);
  }

  const toast = useCallback((data: Omit<ToastData, 'id'>) => {
    return addToast(data);
  }, []);

  return {
    toasts: state,
    toast,
    removeToast,
  };
}
