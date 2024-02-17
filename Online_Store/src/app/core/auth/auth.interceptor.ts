import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {catchError, finalize, Observable, switchMap, throwError} from "rxjs";
import {AuthService} from "./auth.service";
import {DefaultResponseType} from "../../../types/default-response.type";
import {LoginResponseType} from "../../../types/login-response.type";
import {Router} from "@angular/router";
import {TokenType} from "../../../types/token.type";
import {LoaderService} from "../../shared/services/loader.service";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService,
              private loader: LoaderService,
              private router: Router) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.loader.show();
    const tokens: TokenType = this.authService.getTokens();
    if (tokens && tokens.accessToken) {
      const authReq = req.clone({
        headers: req.headers.set('x-access-token', tokens.accessToken)
      });
      return next.handle(authReq).pipe(
        catchError(error => {
          if (error.status === 401 && !authReq.url.includes('/login') && !authReq.url.includes('/refresh')) {
            return this.handle401Error(authReq, next);
          }
          return throwError(() => error);
        }), finalize(() => {
          this.loader.hide();
        })
      );
    }
    return next.handle(req).pipe(finalize(() => {
      this.loader.hide();
    }));
  }

  handle401Error(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return this.authService.refresh().pipe(
      switchMap((result: DefaultResponseType | LoginResponseType) => {
        let error: string = '';
        if (result as DefaultResponseType !== undefined) {
          error = (result as DefaultResponseType).message;
        }
        const refreshResult: LoginResponseType = result as LoginResponseType;
        if (!refreshResult.accessToken || !refreshResult.refreshToken || !refreshResult.userId) {
          error = 'Authorization error';
        }
        if (error) {
          return throwError(() => new Error(error));
        }
        this.authService.setTokens(refreshResult.accessToken, refreshResult.refreshToken);
        const authReq = req.clone({
          headers: req.headers.set('x-access-token', refreshResult.accessToken)
        });
        return next.handle(authReq);
      }),
      catchError(error => {
        this.authService.removeTokens();
        this.router.navigate(['/']);
        return throwError(() => error);
      })
    );
  }
}
