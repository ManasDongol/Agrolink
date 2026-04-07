import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { Auth } from '../Auth/auth';
import { of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

export const routeGuardGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(Auth);
  const router = inject(Router);
  const http = inject(HttpClient);

  return auth.checkAuth().pipe(
    switchMap(user => {
      auth.setAuthenticated(true);

      const requiredRole = route.data['role'];
      if (requiredRole && user.userType !== requiredRole) {
        return of(router.createUrlTree(['/unauthorized']));
      }

      const requireProfile = route.data['requireProfile'];
      if (requireProfile) {
        // Hit backend endpoint to check profile
        return http.get<{ hasProfile: boolean }>('/api/Auth/profileExists').pipe(
          map(res => {
            if (!res.hasProfile) {
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