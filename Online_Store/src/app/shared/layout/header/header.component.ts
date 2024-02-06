import {Component, Input, OnInit} from '@angular/core';
import {AuthService} from "../../../core/auth/auth.service";
import {Router} from "@angular/router";
import {HttpErrorResponse} from "@angular/common/http";
import {MatSnackBar} from "@angular/material/snack-bar";
import {CategoryWithTypeType} from "../../../../types/category-with-type.type";
import {CartService} from "../../services/cart.service";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss', '../../../../assets/styles/_variables.scss']
})
export class HeaderComponent implements OnInit {
  public count: number = 0;
  public isLogged: boolean = false;
  @Input() categories: CategoryWithTypeType[] = [];

  constructor(private authService: AuthService,
              private router: Router,
              private _snackBar: MatSnackBar,
              private cartService: CartService) {
    this.isLogged = this.authService.getIsLoggedIn();
  }

  ngOnInit(): void {
    this.authService.isLogged$.subscribe((isLoggedIn: boolean): void => {
      this.isLogged = isLoggedIn;
    });

    this.cartService.getCartCount().subscribe((data) => {
      this.count = data.count;
      this.cartService.count = data.count;
    });
    this.cartService.count$.subscribe((count: number) => {
      this.count = count;
    });
  }

  logout(): void {
    this.authService.logout()
      .subscribe({
        next: () => {
          this.doLogout();
        },
        error: (errorResponse: HttpErrorResponse) => {
          this.doLogout();
        }
      });
  }

  doLogout(): void {
    this.authService.removeTokens();
    this.authService.userId = null;
    this._snackBar.open('Вы вышли из системы');
    this.router.navigate(['/']);
  }

}
