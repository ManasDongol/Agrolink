import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from './toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.html',
  styleUrl: './toast.css',
  // No animations array — using animate.enter / animate.leave in the template
  // which are compiler-level features, not imported directives (Angular v20.2+)
})
export class Toast {
  toastService = inject(ToastService);

  trackById(_: number, toast: ToastMessage) {
    return toast.id;
  }
}