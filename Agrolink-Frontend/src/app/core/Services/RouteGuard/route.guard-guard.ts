import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { Auth } from '../Auth/auth';
import { of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environments';
import { ToastService } from '../../../shared/toast/toast.service';


export const routeGuardGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(Auth);
  const router = inject(Router);
  const http = inject(HttpClient);
  const toast =inject(ToastService);
  

  return auth.checkAuth().pipe(
    switchMap(user => {
      auth.setAuthenticated(true);

      const requiredRole = route.data['role'];
      if (requiredRole && user.userType !== requiredRole) {
        toast.info("user not authorized to access this page","");

        return of(router.createUrlTree(['/login']));
      }

      const requireProfile = route.data['requireProfile'];
if (requireProfile) {
  return auth.checkProfile().pipe(
    map(res => {
      if (!res) {
        console.log(res);
        return router.createUrlTree([`/buildProfile/${user.id}`]);
      }
      return true;
    }),
    catchError(() => of(router.createUrlTree(['/login'])))
  );
}

      return of(true);
    }),
    catchError(() => {
      auth.setAuthenticated(false);
      return of(router.createUrlTree(['/login']));
    })
  );
};