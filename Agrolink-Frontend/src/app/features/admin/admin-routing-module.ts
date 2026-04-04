import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { AdminLayout } from './shared/admin-layout/admin-layout';
import { ManageAdmins } from './pages/manage-admins/manage-admins';
import { ManagePosts } from './pages/manage-posts/manage-posts';
import { ManageUsers } from './pages/manage-users/manage-users';
import { VerifyUsers } from './pages/verify-users/verify-users';

const routes: Routes = [
  {
    path: '',
    component: AdminLayout,
    children: [
      { path: '', component: Dashboard },
      { path: 'admins', component: ManageAdmins },
      { path: 'posts', component: ManagePosts },
      { path: 'users', component: ManageUsers },
      { path: 'verify-users', component: VerifyUsers },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
