import {Injectable, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {ProductType} from "../../../types/product.type";
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {FavoriteType} from "../../../types/favorite.type";
import {DefaultResponseType} from "../../../types/default-response.type";

@Injectable({
  providedIn: 'root'
})
export class FavoriteService{

  constructor(private http: HttpClient) {
  }

  getProducts(): Observable<FavoriteType[] | DefaultResponseType> {
    return this.http.get<ProductType[] | DefaultResponseType>(environment.apiUrl + "favorites");
  }


}
