import {Component, Input, OnInit} from '@angular/core';
import {ProductType} from "../../../../types/product.type";
import {environment} from "../../../../environments/environment";
import {CartService} from "../../services/cart.service";
import {CartType} from "../../../../types/cart.type";

@Component({
  selector: 'product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss']
})
export class ProductCardComponent implements OnInit {
  @Input() product!: ProductType;
  @Input() isLight: boolean = false;
  public serverStaticPath = environment.serverStaticPath;
  public count: number = 1;
  public isInCart: boolean = false;

  constructor(private cartService: CartService) {
  }

  ngOnInit(): void {

  }

  public updateCount(value: number) {
    console.log(value);
  }

  public addToCart(): void {
    this.cartService.updateCart(this.product.id, this.count).subscribe((data: CartType) => {
      console.log(data);
      this.isInCart = true;
    });
  }

  public removeFromCart(): void {
    this.cartService.updateCart(this.product.id, 0).subscribe((data: CartType) => {
      this.isInCart = false;
      this.count = 1;
    });
  }
}
