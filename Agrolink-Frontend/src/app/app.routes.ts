import { Routes } from '@angular/router';
import { Feed } from './features/feed/feed';
import { Home } from './features/home/home';
import { Network } from './features/network/network';
import { Login } from './features/login/login';
import { Signup } from './features/signup/signup';
import { Messages } from './features/messages/messages';
import { Profile } from './features/profile/profile';
import { UserProfile } from './features/user-profile/user-profile';

export const routes: Routes = [
    {path:"feed",component:Feed},
    {path:"network",component:Network},
    {path:"login",component:Login},
    {path:"signup",component:Signup},
    {path: "messages",component:Messages},
    {path: "buildProfile",component:Profile},
    {path: "userProfile",component:UserProfile},
    {path:"",component:Home}
    
];
