import { Routes } from '@angular/router';
import { Feed } from './features/feed/feed';
import { Home } from './features/home/home';
import { Network } from './features/network/network';
import { Login } from './features/login/login';  
import { Signup } from './features/signup/signup';
import { MessagesComponent } from './features/messages/messages';
import { Profile } from './features/profile/profile';
import { UserProfile } from './features/user-profile/user-profile';
import { Crop } from './features/crop/crop';
import { routeGuardGuard } from './core/Services/RouteGuard/route.guard-guard';
import { DefaultLayout } from './layouts/default-layout/default-layout';
import { EmptyLayout } from './layouts/empty-layout/empty-layout';
import { combineLatest } from 'rxjs';
import { Component } from '@angular/core';
import { Prices } from './features/prices/prices';
import { AiPage } from './features/ai-page/ai-page';
import { ResetPassword } from './features/reset-password/reset-password';

export const routes: Routes = [
    { path: "feed", component:DefaultLayout,children: [{path:'',component:Feed}] , canActivate: [routeGuardGuard],data: { role: 'user', requireProfile: true } },
    { path: "network", component:DefaultLayout,children: [{path:'',component:Network}], canActivate: [routeGuardGuard],data: { role: 'user', requireProfile: true } },
    { path: "messages",  component:DefaultLayout,children: [{path:'',component:MessagesComponent}], canActivate: [routeGuardGuard],data: { role: 'user', requireProfile: true } },
    //{ path: "buildProfile/:id", component:DefaultLayout,children: [{path:'',component:Profile}], canActivate: [routeGuardGuard] },
    { path: "userProfile", component:DefaultLayout,children: [{path:'',component:UserProfile}], canActivate: [routeGuardGuard] ,data: { role: 'user', requireProfile: true }},
     { path: "userProfile/:id", component:DefaultLayout,children: [{path:'',component:UserProfile}], canActivate: [routeGuardGuard],data: { role: 'user', requireProfile: true } },
    { path: "crop",  component:DefaultLayout,children: [{path:'',component:AiPage}], canActivate: [routeGuardGuard],data: { role: 'user', requireProfile: true } },
     { path: "prices",  component:DefaultLayout,children: [{path:'',component:Prices}], canActivate: [routeGuardGuard] ,data: { role: 'user', requireProfile: true }},
      
   
    { path: "buildProfile/:id", component:Profile },
     { path: 'reset-password', component: ResetPassword },

  
    // Public routes
    { path: "login", component: EmptyLayout,children: [{path:'',component:Login}] },
    { path: "signup", component: EmptyLayout,children: [{path:'',component:Signup}]},
    { path: "", component: DefaultLayout,children: [{path:'',component:Home}]},
    { path: "home", component: DefaultLayout,children: [{path:'',component:Home}]},

    //admin side
    { path : "admin",
        loadChildren:()=>import('./features/admin/admin-module').then(m=>m.AdminModule), canActivate: [routeGuardGuard] , data: { role: 'Admin' }
    }
    
 
];
