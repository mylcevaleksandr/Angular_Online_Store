import {Component, OnInit} from '@angular/core';
import {FavoriteService} from "../../../shared/services/favorite.service";
import {FavoriteType} from "../../../../types/favorite.type";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {environment} from "../../../../environments/environment";
import {CartType} from "../../../../types/cart.type";
import {CartService} from "../../../shared/services/cart.service";

@Component({
  selector: 'app-favorite',
  templateUrl: './favorite.component.html',
  styleUrls: ['./favorite.component.scss']
})
export class FavoriteComponent implements OnInit {
  public products: FavoriteType[] = [];
  public serverStaticPath: string = environment.serverStaticPath;

  constructor(private favoriteService: FavoriteService,
              private cartService: CartService) {
  }

  ngOnInit(): void {
    this.favoriteService.getFavorites().subscribe((data: FavoriteType[] | DefaultResponseType) => {
      if ((data as DefaultResponseType).error !== undefined) {
        const error: string = (data as DefaultResponseType).message;
      }
      this.products = data as FavoriteType[];
      this.getCart();
    });
  }

  private getCart() {
    this.cartService.getCart().subscribe((cartData: CartType | DefaultResponseType) => {
      if ((cartData as DefaultResponseType).error !== undefined) {
        throw new Error((cartData as DefaultResponseType).message);
      }
      if (cartData) {
        const productInCart: CartType = (cartData as CartType);
        productInCart.items.forEach(product => {
          this.products = this.products.map((favoriteProduct: FavoriteType) => {
            if (favoriteProduct.id === product.product.id) {
              favoriteProduct.isInCart = true;
              favoriteProduct.amount = product.quantity;
              return favoriteProduct;
            }
            return favoriteProduct;
          });
        });
      }
    });
  }

  public removeFromFavorites(productId: string) {
    this.favoriteService.removeFavorite(productId).subscribe((data: DefaultResponseType) => {
      if (data.error) {
        throw new Error(data.message);
      }
      this.products = this.products.filter((item: FavoriteType): boolean => item.id !== productId);
    });
  }

  public addToCart(productId: string, amount: number): void {
    this.cartService.updateCart(productId, amount).subscribe((cartData: CartType | DefaultResponseType) => {
      if ((cartData as DefaultResponseType).error !== undefined) {
        throw new Error((cartData as DefaultResponseType).message);
      }
      if (cartData) {
        const productInCart = (cartData as CartType).items.find(item => item.product.id === productId);
        this.products = this.products.map((favoriteProduct: FavoriteType) => {
          if (favoriteProduct.id === productId) {
            favoriteProduct.isInCart = true;
            if (productInCart) {
              favoriteProduct.amount = productInCart.quantity;
            }
            return favoriteProduct;
          }
          return favoriteProduct;
        });
      }
    });
  }

  public removeFromCart(productId: string): void {
    this.cartService.updateCart(productId, 0).subscribe((data: CartType | DefaultResponseType) => {
      this.products = this.products.map(favoriteProduct => {
        if (favoriteProduct.id === productId) {
          favoriteProduct.isInCart = false;
          return favoriteProduct;
        }
        return favoriteProduct;
      });
    });
  }

  public updateCount(id: string, value: number): void {
    this.addToCart(id, value);
  }
}
