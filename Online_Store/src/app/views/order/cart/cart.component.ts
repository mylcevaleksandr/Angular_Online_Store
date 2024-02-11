import {Component, OnInit} from '@angular/core';
import {OwlOptions} from "ngx-owl-carousel-o";
import {ProductService} from "../../../shared/services/product.service";
import {ProductType} from "../../../../types/product.type";
import {CartService} from "../../../shared/services/cart.service";
import {CartType} from "../../../../types/cart.type";
import {environment} from "../../../../environments/environment";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {CalculateCartTotalUtil} from "../../../shared/utils/calculate-cart-total.util";

@Component({
  selector: 'cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  public count: number = 1;
  public extraProducts: ProductType[] = [];
  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    margin: 24,
    dots: false,
    navSpeed: 700,
    navText: ['', ''],
    responsive: {
      0: {
        items: 1
      },
      400: {
        items: 2
      },
      740: {
        items: 3
      },
      940: {
        items: 4
      }
    },
    nav: false
  };
  public cart: CartType | null = null;
  public serverStaticPath = environment.serverStaticPath;
  public totalAmount: number = 0;
  public totalCount: number = 0;

  constructor(private productService: ProductService, private cartService: CartService) {
  }

  ngOnInit(): void {
    this.productService.getBestProducts()
      .subscribe((data: ProductType[]) => {
        this.extraProducts = data;
      });
    this.cartService.getCart().subscribe((data: CartType | DefaultResponseType) => {
      if ((data as DefaultResponseType).error !== undefined) {
        throw new Error((data as DefaultResponseType).message);
      }
      this.cart = data as CartType;
      CalculateCartTotalUtil.calculateTotal(this);
    });
  }

  public updateCount(id: string, count: number) {
    if (this.cart) {
      this.cartService.updateCart(id, count).subscribe((data: CartType | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }
        this.cart = data as CartType;
        CalculateCartTotalUtil.calculateTotal(this);
      });
    }
  }
}
