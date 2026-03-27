import { writable } from 'svelte/store';

type ToastVariant = 'success' | 'error' | 'warning';

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
}

function createId() {
  return Math.random().toString(36).substring(2, 9);
}

export const toasts = writable<Toast[]>([]);

export function toast(message: string, variant: ToastVariant = 'success', duration = 3000) {
  const id = createId();
  const newToast: Toast = { id, message, variant, duration };
  
  toasts.update(current => [...current, newToast]);
  
  if (duration > 0) {
    setTimeout(() => {
      toasts.update(current => current.filter(t => t.id !== id));
    }, duration);
  }
}

toast.success = (message: string, duration?: number) => toast(message, 'success', duration);
toast.error = (message: string, duration = 5000) => toast(message, 'error', duration);
toast.warning = (message: string, duration = 4000) => toast(message, 'warning', duration);

export function removeToast(id: string) {
  toasts.update(current => current.filter(t => t.id !== id));
}
