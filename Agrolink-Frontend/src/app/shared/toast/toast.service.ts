import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private counter = 0;
  toasts = signal<ToastMessage[]>([]);

  private add(toast: Omit<ToastMessage, 'id'>) {
    const id = ++this.counter;
    this.toasts.update(t => [...t, { ...toast, id }]);
    setTimeout(() => this.remove(id), toast.duration ?? 4000);
  }

  remove(id: number) {
    this.toasts.update(t => t.filter(toast => toast.id !== id));
  }

  success(title: string, message: string, duration = 4000) {
    this.add({ type: 'success', title, message, duration });
  }

  error(title: string, message: string, duration = 5000) {
    this.add({ type: 'error', title, message, duration });
  }

  info(title: string, message: string, duration = 4000) {
    this.add({ type: 'info', title, message, duration });
  }
}