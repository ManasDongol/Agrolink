import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing-module';
import { Dashboard } from './pages/dashboard/dashboard';
import { AdminLayout } from './shared/admin-layout/admin-layout';
import { Sidebar } from './shared/sidebar/sidebar';
import { ManageAdmins } from './pages/manage-admins/manage-admins';
import { ManagePosts } from './pages/manage-posts/manage-posts';
import { ManageUsers } from './pages/manage-users/manage-users';
import { VerifyUsers } from './pages/verify-users/verify-users';

@NgModule({
  declarations: [
    AdminLayout,
    Sidebar,
    Dashboard,
    ManageAdmins,
    ManagePosts,
    ManageUsers,
    VerifyUsers,
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
  ]
})
export class AdminModule { }
