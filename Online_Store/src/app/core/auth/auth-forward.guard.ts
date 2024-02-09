import {ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {AuthService} from "./auth.service";
import {Observable} from "rxjs";
import {inject} from "@angular/core";

export const authForwardGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree => {
  const authService: AuthService = inject(AuthService);
  const router:Router = inject(Router);
  if (authService.getIsLoggedIn()) {
    router.navigate(['']);
    return false;
  }
  return true;
};
