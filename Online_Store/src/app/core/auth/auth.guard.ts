import {ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable} from "rxjs";
import {inject} from "@angular/core";
import {AuthService} from "./auth.service";
import {MatSnackBar} from "@angular/material/snack-bar";

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree => {
  const authService: AuthService = inject(AuthService);
  const _snackBar: MatSnackBar = inject(MatSnackBar);
  const isLoggedIn: boolean = authService.getIsLoggedIn();
  if (!isLoggedIn) {
    _snackBar.open('Для доступа необходимо авторизоватся!');
  }
  return isLoggedIn;
};

