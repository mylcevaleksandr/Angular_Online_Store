import {Injectable} from '@angular/core';
import {DefaultResponseType} from "../../../types/default-response.type";
import {LoginResponseType} from "../../../types/login-response.type";
import {FormBuilder} from "@angular/forms";
import {AuthService} from "../../core/auth/auth.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Router} from "@angular/router";
import {FavoriteType} from "../../../types/favorite.type";
import {ProductType} from "../../../types/product.type";
import {FavoriteService} from "./favorite.service";
import {CartService} from "./cart.service";

@Injectable({
  providedIn: 'root'
})
export class RepeatedCodeService {

  constructor(private fb: FormBuilder,
              private authService: AuthService,
              private _snackBar: MatSnackBar,
              private favoriteService: FavoriteService,
              private cartService: CartService,
              private router: Router) {
  }

  public performOperation(data: DefaultResponseType | LoginResponseType, operationType: string) {
    let error = null;
    if ((data as DefaultResponseType).error !== undefined) {
      error = (data as DefaultResponseType).message;
    }
    const loginResponse: LoginResponseType = data as LoginResponseType;
    if (!loginResponse.accessToken || !loginResponse.refreshToken || !loginResponse.userId) {
      error = "Что-то пошло не так";
    }
    if (error) {
      this._snackBar.open(error);
      throw new Error(error);
    }
    this.authService.setTokens(loginResponse.accessToken, loginResponse.refreshToken);
    this.authService.userId = loginResponse.userId;
    if (operationType === 'signup') {
      this._snackBar.open(" Вы успешно зарегистрировались");
    } else if (operationType === 'login') {
      this._snackBar.open(" Вы успешно авторизовались");
    }
    this.router.navigate(['/']);
  }

  public updateFavorite(product: ProductType): boolean | undefined {
    if (!this.authService.getIsLoggedIn()) {
      this._snackBar.open('Для добавления в избранное необходимо авторизоватся!');
      return;
    }
    if (product.isInFavorite && product.isInFavorite !== undefined) {
      this.favoriteService.removeFavorite(product.id).subscribe((data: DefaultResponseType) => {
        if (data.error) {
          throw new Error(data.message);
        }
      });
      return false;
    } else {
      this.favoriteService.addFavorite(product.id).subscribe((data: DefaultResponseType | FavoriteType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          const error = (data as DefaultResponseType).message;
          throw new Error((data as DefaultResponseType).message);
        }
      });
      return true;
    }
  }

  public getCart(): void {
    this.cartService.getCartCount().subscribe((data: { count: number } | DefaultResponseType) => {
      if ((data as DefaultResponseType).error !== undefined) {
        throw new Error((data as DefaultResponseType).message);
      }
      this.cartService.setCount((data as { count: number }).count);
    });
  }
}
