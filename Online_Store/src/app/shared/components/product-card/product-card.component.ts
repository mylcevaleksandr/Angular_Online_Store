import {Component, Input, OnInit} from '@angular/core';
import {ProductType} from "../../../../types/product.type";
import {environment} from "../../../../environments/environment";
import {CartService} from "../../services/cart.service";
import {CartType} from "../../../../types/cart.type";
import {Router} from "@angular/router";
import {AuthService} from "../../../core/auth/auth.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {RepeatedCodeService} from "../../services/repeatedCode.service";
import {DefaultResponseType} from "../../../../types/default-response.type";

@Component({
  selector: 'product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss']
})
export class ProductCardComponent implements OnInit {
  @Input() product!: ProductType;
  @Input() isLight: boolean = false;
  @Input() countInCart: number | undefined = 0;
  public serverStaticPath = environment.serverStaticPath;
  public count: number = 1;

  constructor(private cartService: CartService,
              private router: Router,
              private authService: AuthService,
              private _snackBar: MatSnackBar,
              private repeatedCodeService: RepeatedCodeService) {
  }

  ngOnInit(): void {
    if (this.countInCart && this.countInCart > 1) {
      this.count = this.countInCart;

    }
  }

  public lightCardRedirect() {
    if (this.isLight) {
      this.router.navigate(['/product/' + this.product.url]);
    }
  }

  public updateFavorite():void {
    this.product.isInFavorite = this.repeatedCodeService.updateFavorite(this.product);
  }

  public updateCount(value: number):void {
    this.count = value;
    if (this.countInCart) {
      this.cartService.updateCart(this.product.id, this.count).subscribe((data: CartType | DefaultResponseType) => {
        this.countInCart = this.count;
      });
    }
  }

  public addToCart(): void {
    this.cartService.updateCart(this.product.id, this.count).subscribe((data: CartType | DefaultResponseType) => {
      this.countInCart = this.count;
    });
  }

  public removeFromCart(): void {
    this.cartService.updateCart(this.product.id, 0).subscribe((data: CartType | DefaultResponseType) => {
      this.countInCart = 0;
      this.count = 1;
    });
  }
}
