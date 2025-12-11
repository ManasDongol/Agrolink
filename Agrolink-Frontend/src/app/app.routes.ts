import { Routes } from '@angular/router';
import { Feed } from './features/feed/feed';
import { Home } from './features/home/home';
import { Network } from './features/network/network';
import { Login } from './features/login/login';
import { Signup } from './features/signup/signup';

export const routes: Routes = [
    {path:"feed",component:Feed},
    {path:"network",component:Network},
    {path:"login",component:Login},
    {path:"signup",component:Signup},
    {path:"",component:Home}
    
];
