import {Component, Input, OnInit} from '@angular/core';
import {AuthService} from "../../../core/auth/auth.service";
import {Router} from "@angular/router";
import {HttpErrorResponse} from "@angular/common/http";
import {MatSnackBar} from "@angular/material/snack-bar";
import {CategoryWithTypeType} from "../../../../types/category-with-type.type";
import {CartService} from "../../services/cart.service";
import {RepeatedCodeService} from "../../services/repeatedCode.service";
import {ProductService} from "../../services/product.service";
import {ProductType} from "../../../../types/product.type";
import {environment} from "../../../../environments/environment";
import {FormControl} from "@angular/forms";
import {debounceTime} from "rxjs";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss', '../../../../assets/styles/_variables.scss']
})
export class HeaderComponent implements OnInit {
  public searchField = new FormControl();
  public showSearch: boolean = false;
  public serverStaticPath: string = environment.serverStaticPath;
  public products: ProductType[] = [];
  public count: number = 0;
  public isLogged: boolean = false;
  @Input() categories: CategoryWithTypeType[] = [];

  constructor(private authService: AuthService,
              private _snackBar: MatSnackBar,
              private cartService: CartService,
              private repeatedCodeService: RepeatedCodeService,
              private productService: ProductService,
              private router: Router,) {
    this.isLogged = this.authService.getIsLoggedIn();
  }

  ngOnInit(): void {
    this.searchField.valueChanges.pipe(debounceTime(500)).subscribe(value => {
      if (value && value.length > 2) {
        this.productService.searchProducts(value).subscribe((data: ProductType[]) => {
          this.products = data;
        });
      } else {
        this.products = [];
      }
    });
    this.repeatedCodeService.getCart();
    this.authService.isLogged$.subscribe((isLoggedIn: boolean): void => {
      this.isLogged = isLoggedIn;
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
    this.repeatedCodeService.getCart();
    this.router.navigate(['']);
  }

  // public changeSearchValue(newValue: string) {
  //   this.searchValue = newValue;
  //
  // }

  public selectProduct(productUrl: string) {
    this.router.navigate(['/product/' + productUrl]);
    this.searchField.setValue('');
    this.products = [];
  }

  public changeShowedSearch(value: boolean) {
    setTimeout(() => {
      this.showSearch = value;
    }, 300);
  }

//   Alternate method to hide popup
//   @HostListener('document:click', ['$event']) click(event:Event) {
//     if (this.showSearch && (event.target as HTMLElement).className.indexOf('search-product') === -1) {
//       this.showSearch = false;
//     }
//   }
}
