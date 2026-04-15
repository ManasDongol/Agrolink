import { Component, OnInit, inject } from '@angular/core';
import { AdminService, AdminUser } from '../../../../core/Services/Admin/admin.service';
import { ToastService } from '../../../../shared/toast/toast.service';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors ,ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-manage-admins',
  standalone: false,
  templateUrl: './manage-admins.html',
  styleUrl: './manage-admins.css',
})
export class ManageAdmins implements OnInit {
  admins: AdminUser[] = [];
  loading = true;
  error?: string;

  // Delete modal
  showDeleteConfirm = false;
  pendingDeleteId: string | null = null;
  isDeleting = false;

  // Add Admin modal
  showAddAdmin = false;
  isAdding = false;
  showPassword = false;
  showConfirmPassword = false;
  addAdminForm!: FormGroup;

  toast = inject(ToastService);

  constructor(private adminService: AdminService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.loadAdmins();
    this.initForm();
  }

  initForm() {
    this.addAdminForm = this.fb.group(
      {
        username: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password === confirm ? null : { passwordMismatch: true };
  }

  get f() {
    return this.addAdminForm.controls;
  }

  openAddAdmin() {
    this.addAdminForm.reset();
    this.showPassword = false;
    this.showConfirmPassword = false;
    this.showAddAdmin = true;
  }

  closeAddAdmin() {
    this.showAddAdmin = false;
    this.addAdminForm.reset();
  }

  submitAddAdmin() {
    this.addAdminForm.markAllAsTouched();
    if (this.addAdminForm.invalid || this.isAdding) return;

    this.isAdding = true;

    const payload = {
      Username: this.f['username'].value,
      Email: this.f['email'].value,
      Password: this.f['password'].value,
      UserType: 'Admin',
    };

    this.adminService.addAdmin(payload).subscribe({
      next: (newAdmin) => {
        this.admins.push(newAdmin);
        this.toast.success('Admin added successfully!', '');
        this.closeAddAdmin();
        this.isAdding = false;
      },
      error: () => {
        this.toast.error('Failed to add admin. Try again later.', '');
        this.isAdding = false;
      },
    });
  }

  loadAdmins() {
    this.adminService.getAdmins().subscribe({
      next: (admins) => {
        this.admins = admins;
        this.toast.success('Admins loaded successfully!', '');
        this.loading = false;
      },
      error: () => {
        this.error = 'Unable to load admins.';
        this.toast.error('Unable to load admins, try again later!', '');
        this.loading = false;
      },
    });
  }

  openDeleteConfirm(id: string) {
    this.pendingDeleteId = id;
    this.showDeleteConfirm = true;
  }

  cancelDelete() {
    this.pendingDeleteId = null;
    this.showDeleteConfirm = false;
  }

  confirmDelete() {
    if (!this.pendingDeleteId) return;
    this.isDeleting = true;
    this.adminService.deleteAdmin(this.pendingDeleteId).subscribe({
      next: () => {
        this.admins = this.admins.filter((a) => a.id !== this.pendingDeleteId);
        this.cancelDelete();
        this.toast.success('Admin deleted successfully!', '');
        this.isDeleting = false;
      },
      error: () => {
        this.isDeleting = false;
        this.toast.error('Unable to delete admin, try again later!', '');
      },
    });
  }
}