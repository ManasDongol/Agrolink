import { Routes } from '@angular/router';
import { Feed } from './features/feed/feed';
import { Home } from './features/home/home';
import { Network } from './features/network/network';
import { Login } from './features/login/login';  
import { Signup } from './features/signup/signup';
import { Messages } from './features/messages/messages';
import { Profile } from './features/profile/profile';
import { UserProfile } from './features/user-profile/user-profile';
import { Crop } from './features/crop/crop';
import { routeGuardGuard } from './core/Services/RouteGuard/route.guard-guard';

export const routes: Routes = [
    { path: "feed", component: Feed, canActivate: [routeGuardGuard] },
    { path: "network", component: Network, canActivate: [routeGuardGuard] },
    { path: "messages", component: Messages, canActivate: [routeGuardGuard] },
    { path: "buildProfile", component: Profile, canActivate: [routeGuardGuard] },
    { path: "userProfile", component: UserProfile, canActivate: [routeGuardGuard] },
    { path: "crop", component: Crop, canActivate: [routeGuardGuard] },

    // Public routes
    { path: "login", component: Login },
    { path: "signup", component: Signup },
    { path: "", component: Home }
];
