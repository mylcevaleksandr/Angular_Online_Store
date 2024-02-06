import {Component, OnInit} from '@angular/core';
import {OwlOptions} from "ngx-owl-carousel-o";
import {ProductType} from "../../../../types/product.type";
import {ProductService} from "../../../shared/services/product.service";
import {ActivatedRoute, Router} from "@angular/router";
import {environment} from "../../../../environments/environment";
import {CartType} from "../../../../types/cart.type";
import {CartService} from "../../../shared/services/cart.service";

@Component({
  selector: 'detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {
  public products: ProductType[] = [];
  public product!: ProductType;
  public count: number = 1;
  public serverStaticPath = environment.serverStaticPath;

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

  constructor(private productService: ProductService,
              private activatedRoute: ActivatedRoute,
              private router: Router,
              private cartService: CartService) {
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      this.productService.getProduct(params['url']).subscribe((data: ProductType) => {
        this.cartService.getCart().subscribe((cartData: CartType) => {
          if (cartData) {
            const productInCart = cartData.items.find(item => item.product.id === data.id);
            if (productInCart) {
              data.countInCart = productInCart.quantity;
              this.count = data.countInCart;
            }
          }
          this.product = data;
        });
      });
    });
    this.productService.getBestProducts().subscribe((data: ProductType[]) => {
      this.products = data;
    });
  }

  updateCount(value: number): void {
    this.count = value;
    if (this.product.countInCart) {
      this.cartService.updateCart(this.product.id, this.count).subscribe((data: CartType) => {
        this.product.countInCart = this.count;
      });
    }
  }

  public addToCart(): void {
    this.cartService.updateCart(this.product.id, this.count).subscribe((data: CartType) => {
      this.product.countInCart = this.count;
    });
    // this.router.navigate(['/cart']);
  }

  public removeFromCart() {
    this.cartService.updateCart(this.product.id, 0).subscribe((data: CartType) => {
      this.product.countInCart = 0;
      this.count = 1;
    });
  }
}
