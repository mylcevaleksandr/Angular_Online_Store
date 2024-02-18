import {Component, OnInit} from '@angular/core';
import {OwlOptions} from "ngx-owl-carousel-o";
import {ProductType} from "../../../../types/product.type";
import {ProductService} from "../../../shared/services/product.service";
import {ActivatedRoute, Router} from "@angular/router";
import {environment} from "../../../../environments/environment";
import {CartType} from "../../../../types/cart.type";
import {CartService} from "../../../shared/services/cart.service";
import {FavoriteService} from "../../../shared/services/favorite.service";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {FavoriteType} from "../../../../types/favorite.type";
import {AuthService} from "../../../core/auth/auth.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {RepeatedCodeService} from "../../../shared/services/repeatedCode.service";

@Component({
  selector: 'detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {
  public products: ProductType[] = [];
  private favoriteProducts: FavoriteType[] = [];
  public product!: ProductType;
  public count: number = 1;
  public isLogged: boolean = false;
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
              private cartService: CartService,
              private favoriteService: FavoriteService,
              private authService: AuthService,
              private _snackBar: MatSnackBar,
              private repeatedCodeService: RepeatedCodeService) {
  }

  ngOnInit(): void {
    this.isLogged = this.authService.getIsLoggedIn();
    this.activatedRoute.params.subscribe(params => {
      this.count = 1;
      this.productService.getProduct(params['url']).subscribe((data: ProductType) => {
        this.product = data;
        this.cartService.getCart().subscribe((cartData: CartType | DefaultResponseType) => {
          if ((cartData as DefaultResponseType).error !== undefined) {
            throw new Error((cartData as DefaultResponseType).message);
          }
          if (cartData) {
            const productInCart = (cartData as CartType).items.find(item => item.product.id === this.product.id);
            if (productInCart) {
              this.product.countInCart = productInCart.quantity;
              this.count = this.product.countInCart;
            }
          }
        });
        if (this.isLogged) {
          this.favoriteService.getFavorites().subscribe({
            next: (data: FavoriteType[] | DefaultResponseType) => {
              if ((data as DefaultResponseType).error !== undefined) {
                const error = (data as DefaultResponseType).message;
                this.processCatalog();
                throw new Error(error);
              }
              const products: FavoriteType[] = data as FavoriteType[];
              const productExists = products.filter(item => item.id === this.product.id);
              if (productExists && productExists.length > 0) {
                this.product.isInFavorite = true;
              }
              this.favoriteProducts = data as FavoriteType[];
              this.processCatalog();
            },
            error: (error) => {
              console.log(error);
              this.processCatalog();
            }
          });
        } else {
          this.processCatalog();
        }
      });
    });
  }

  processCatalog() {
    this.productService.getBestProducts().subscribe((data: ProductType[]) => {
      this.products = data;
      if (this.favoriteProducts && this.favoriteProducts.length > 0) {
        this.products = this.products.map((product: ProductType) => {
          const productInFavorite: FavoriteType | undefined = this.favoriteProducts?.find(item => item.id === product.id);
          if (productInFavorite) {
            product.isInFavorite = true;
          }
          return product;
        });
      }
    });
  }


  updateCount(value: number): void {
    this.count = value;
    if (this.product && this.product.countInCart) {
      this.addToCart();
    }
  }

  updateFavorite(product: ProductType) {
    this.product.isInFavorite = this.repeatedCodeService.updateFavorite(product);
  }

  public addToCart(): void {
    this.cartService.updateCart(this.product.id, this.count).subscribe((data: CartType | DefaultResponseType) => {
      if ((data as DefaultResponseType).error !== undefined) {
        const error = (data as DefaultResponseType).message;
        throw new Error(error);
      }
      this.product.countInCart = this.count;
    });
  }

  public removeFromCart() {
    this.cartService.updateCart(this.product.id, 0).subscribe((data: CartType | DefaultResponseType) => {
      if ((data as DefaultResponseType).error !== undefined) {
        const error = (data as DefaultResponseType).message;
        throw new Error(error);
      }

      this.product.countInCart = 0;
      this.count = 1;
    });
  }
}
