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

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss']
})
export class CatalogComponent implements OnInit {
  public products: ProductType[] = [];
  public categoriesWithTypes: CategoryWithTypeType[] = [];
  public activeParams: ActiveParamsType = {types: []};
  public appliedFilters: AppliedFilterType[] = [];


  constructor(private productService: ProductService,
              private categoryService: CategoryService,
              private activatedRoute: ActivatedRoute,
              private router: Router) {
  }

  ngOnInit(): void {
    this.categoryService.getCategoriesWithTypes().subscribe(data => {
      this.categoriesWithTypes = data;
      this.activatedRoute.queryParams.subscribe(params => {
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
      });
    });
    this.productService.getProducts().subscribe(data => {
      this.products = data.items;
    });
  }

  public removeAppliedFilter(appliedFilter: AppliedFilterType) {
    if (appliedFilter.urlParam === SizeVariablesUtil.heightFrom || appliedFilter.urlParam === SizeVariablesUtil.heightTo || appliedFilter.urlParam === SizeVariablesUtil.diameterFrom || appliedFilter.urlParam === SizeVariablesUtil.diameterTo) {
      delete this.activeParams[appliedFilter.urlParam as keyof ActiveParamsType];
    } else {
      this.activeParams.types = this.activeParams.types.filter(item => item !== appliedFilter.urlParam);
    }
    this.router.navigate(['/catalog'], {
      queryParams: this.activeParams
    });
  }

}
