import {Component, OnInit} from '@angular/core';
import {ProductService} from "../../../shared/services/product.service";
import {ProductType} from "../../../../types/product.type";
import {CategoryService} from "../../../shared/services/category.service";
import {CategoryWithTypeType} from "../../../../types/category-with-type.type";
import {ActivatedRoute, Router} from "@angular/router";
import {ActiveParamsType} from "../../../../types/active-params.type";
import {ActiveParamsUtil} from "../../../shared/utils/active-params.util";
import {AppliedFilterType} from "../../../../types/applied-filter.type";
import {SizeVariablesUtil} from "../../../shared/utils/sizeVariables.util";
import {debounceTime} from "rxjs";
import {CartService} from "../../../shared/services/cart.service";
import {CartType} from "../../../../types/cart.type";
import {FavoriteType} from "../../../../types/favorite.type";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {FavoriteService} from "../../../shared/services/favorite.service";
import {AuthService} from "../../../core/auth/auth.service";

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss']
})
export class CatalogComponent implements OnInit {
  public products: ProductType[] = [];
  public product!: ProductType;
  private favoriteProducts: FavoriteType[] = [];
  public categoriesWithTypes: CategoryWithTypeType[] = [];
  public activeParams: ActiveParamsType = {types: []};
  public appliedFilters: AppliedFilterType[] = [];
  public sortingOpen: boolean = false;
  public sortingOptions: { name: string, value: string }[] = [
    {name: 'От А до Я', value: 'az-asc'},
    {name: 'От Я до А', value: 'az-desc'},
    {name: 'По возрастанию цены', value: 'price-asc'},
    {name: 'По убыванию цены', value: 'price-desc'},
  ];
  public pages: number[] = [];
  public cart: CartType | null = null;


  constructor(private productService: ProductService,
              private categoryService: CategoryService,
              private activatedRoute: ActivatedRoute,
              private cartService: CartService,
              private favoriteService: FavoriteService,
              private authService: AuthService,
              private router: Router) {
  }

  ngOnInit(): void {
    this.cartService.getCart().subscribe((data: CartType | DefaultResponseType) => {
      if ((data as DefaultResponseType).error !== undefined) {
        throw new Error((data as DefaultResponseType).message);
      }
      this.cart = data as CartType;
      if (this.authService.getIsLoggedIn()) {
        this.favoriteService.getFavorites().subscribe({
          next: (data: FavoriteType[] | DefaultResponseType) => {
            if ((data as DefaultResponseType).error !== undefined) {
              const error = (data as DefaultResponseType).message;
              this.processCatalog();
              console.log(error);
              throw new Error(error);
            }
            this.favoriteProducts = data as FavoriteType[];
            this.processCatalog();
          },
          error: (error) => {
            console.log(error.error);

            this.processCatalog();
          }
        });
      } else {
        this.processCatalog();
      }
    });
  }

  private processCatalog() {
    this.categoryService.getCategoriesWithTypes().subscribe(data => {
      this.categoriesWithTypes = data;
      this.activatedRoute.queryParams.pipe(debounceTime(500)).subscribe(params => {
        this.activeParams = ActiveParamsUtil.processParams(params);
        this.appliedFilters = [];
        this.activeParams.types.forEach(url => {
          for (let i = 0; i < this.categoriesWithTypes.length; i++) {
            const foundType = this.categoriesWithTypes[i].types.find(type => type.url === url);
            if (foundType) {
              this.appliedFilters.push({
                name: foundType.name,
                urlParam: foundType.url
              });
            }
          }
        });
        if (this.activeParams.heightFrom) {
          this.appliedFilters.push({
            name: 'Высота: от ' + this.activeParams.heightFrom + ' см',
            urlParam: SizeVariablesUtil.heightFrom
          });
        }
        if (this.activeParams.heightTo) {
          this.appliedFilters.push({
            name: 'Высота: до ' + this.activeParams.heightTo + ' см',
            urlParam: SizeVariablesUtil.heightTo
          });
        }
        if (this.activeParams.diameterFrom) {
          this.appliedFilters.push({
            name: 'Диаметр: от ' + this.activeParams.diameterFrom + ' см',
            urlParam: SizeVariablesUtil.diameterFrom
          });
        }
        if (this.activeParams.diameterTo) {
          this.appliedFilters.push({
            name: 'Диаметр: до ' + this.activeParams.diameterTo + ' см',
            urlParam: SizeVariablesUtil.diameterTo
          });
        }
        this.productService.getProducts(this.activeParams).subscribe(data => {
          this.pages = [];
          for (let i = 1; i <= data.pages; i++) {
            this.pages.push(i);
          }
          if (this.cart && this.cart.items.length > 0) {
            this.products = data.items.map((product: ProductType) => {
              const productInCart = this.cart?.items.find(item => item.product.id === product.id);
              if (productInCart) {
                product.countInCart = productInCart.quantity;
              }
              return product;
            });
          } else {
            this.products = data.items;
          }
          if (this.favoriteProducts && this.favoriteProducts.length > 0) {
            this.products = this.products.map((product: ProductType) => {
              const productInFavorite: FavoriteType | undefined = this.favoriteProducts?.find(item => item.id === product.id);
              if (productInFavorite) {
                product.isInFavorite = true;
              }
              return product;
            });
          }
          // document.getElementById("point")?.scrollIntoView({behavior: "smooth"});
        });
      });
    });
  }

  public removeAppliedFilter(appliedFilter: AppliedFilterType) {
    if (appliedFilter.urlParam === SizeVariablesUtil.heightFrom || appliedFilter.urlParam === SizeVariablesUtil.heightTo || appliedFilter.urlParam === SizeVariablesUtil.diameterFrom || appliedFilter.urlParam === SizeVariablesUtil.diameterTo) {
      delete this.activeParams[appliedFilter.urlParam as keyof ActiveParamsType];
    } else {
      this.activeParams.types = this.activeParams.types.filter(item => item !== appliedFilter.urlParam);
    }
    this.activeParams.page = 1;
    this.navigate();
  }

  public toggleSorting(): void {
    this.sortingOpen = !this.sortingOpen;
  }

  public sort(value: string): void {
    this.activeParams.sort = value;
    this.navigate();
  }

  public openPage(page: number): void {
    this.activeParams.page = page;
    this.navigate();
  }

  public openPrevPage(): void {
    if (this.activeParams.page && this.activeParams.page > 1) {
      this.activeParams.page--;
      this.navigate();
    }
  }

  public openNextPage(): void {
    if (this.activeParams.page && this.activeParams.page < this.pages.length) {
      this.activeParams.page++;
      this.navigate();
    }
  }

  private navigate(): void {
    this.router.navigate(['/catalog'], {
      queryParams: this.activeParams
    });
  }
}
