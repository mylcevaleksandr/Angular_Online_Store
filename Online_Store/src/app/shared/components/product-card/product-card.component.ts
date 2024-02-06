import {Component, Input, OnInit} from '@angular/core';
import {ProductType} from "../../../../types/product.type";
import {environment} from "../../../../environments/environment";
import {CartService} from "../../services/cart.service";
import {CartType} from "../../../../types/cart.type";
import {Router} from "@angular/router";

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

  constructor(private cartService: CartService, private router: Router) {
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

  public updateCount(value: number) {
    this.count = value;
    if (this.countInCart) {
      this.cartService.updateCart(this.product.id, this.count).subscribe((data: CartType) => {
        this.countInCart = this.count;
      });
    }
  }

  public addToCart(): void {
    this.cartService.updateCart(this.product.id, this.count).subscribe((data: CartType) => {
      this.countInCart = this.count;
    });
  }

  public removeFromCart(): void {
    this.cartService.updateCart(this.product.id, 0).subscribe((data: CartType) => {
      this.countInCart = 0;
      this.count = 1;
    });
  }
}
