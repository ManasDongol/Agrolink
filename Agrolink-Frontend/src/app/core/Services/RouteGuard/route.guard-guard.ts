import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Auth } from '../Auth/auth';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export const routeGuardGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);

  // Call backend /me endpoint
  return auth.checkAuth().pipe(
    map(user => {
      // User is logged in
      auth.setAuthenticated(true); // update BehaviorSubject
      return true;
    }),
    catchError(err => {
      // Not logged in → redirect to login
      auth.setAuthenticated(false);
      return of(router.createUrlTree(['/login']));
    })
  );
};
