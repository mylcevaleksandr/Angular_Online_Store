import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {CartType} from "../../../types/cart.type";

@Injectable({
  providedIn: 'root'
})
export class CartService {

  constructor(private http: HttpClient) {
  }

  public getCart(): Observable<CartType> {
    return this.http.get<CartType>(environment.apiUrl + "cart", {withCredentials: true});
  }

  public updateCart(productId: string, quantity: number): Observable<CartType> {
    return this.http.post<CartType>(environment.apiUrl + "cart", {
      productId,
      quantity
    }, {withCredentials: true});
  }
}
