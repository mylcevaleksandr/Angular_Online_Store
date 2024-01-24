import {Component, Input, OnInit} from '@angular/core';
import {CategoryWithTypeType} from "../../../../types/category-with-type.type";
import {ActivatedRoute, Router} from "@angular/router";
import {ActiveParamsType} from "../../../../types/active-params.type";
import {SizeVariablesUtil} from "../../utils/sizeVariables.util";
import {ActiveParamsUtil} from "../../utils/active-params.util";

@Component({
  selector: 'category-filter',
  templateUrl: './category-filter.component.html',
  styleUrls: ['./category-filter.component.scss']
})
export class CategoryFilterComponent implements OnInit {
  @Input() categoryWithTypes: CategoryWithTypeType | null = null;
  @Input() type: string | null = null;
  public open: boolean = false;
  public activeParams: ActiveParamsType = {types: []};
  public from: number | null = null;
  public to: number | null = null;

  constructor(private router: Router,
              private activatedRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(params => {
      this.activeParams = ActiveParamsUtil.processParams(params);
      if (this.type) {
        if (this.type === 'height') {
          this.open = !!(this.activeParams.heightFrom || this.activeParams.heightTo);
          this.from = this.activeParams.heightFrom ? +this.activeParams.heightFrom : null;
          this.to = this.activeParams.heightTo ? +this.activeParams.heightTo : null;
        } else if (this.type === 'diameter') {
          this.open = !!(this.activeParams.diameterFrom || this.activeParams.diameterTo);
          this.from = this.activeParams.diameterFrom ? +this.activeParams.diameterFrom : null;
          this.to = this.activeParams.diameterTo ? +this.activeParams.diameterTo : null;
        }
      } else {
        if (params['types']) {
          this.activeParams.types = Array.isArray(params['types']) ? params['types'] : [params['types']];
        }
        if (this.categoryWithTypes && this.categoryWithTypes.types && this.categoryWithTypes.types.length > 0 && this.categoryWithTypes.types.some(type => this.activeParams.types.find(item => type.url === item))) {
          this.open = true;
        } else {
          this.open = false;
        }
      }
    });
  }

  public get title(): string {
    if (this.categoryWithTypes) {
      return this.categoryWithTypes.name;
    } else if (this.type) {
      if (this.type === 'height') {
        return 'Высота';
      } else if (this.type === 'diameter') {
        return 'Диаметр';
      }
    }
    return '';
  }

  public toggle(): void {
    this.open = !this.open;
  }

  public updateFilterParam(url: string, checked: boolean) {
    if (this.activeParams && this.activeParams.types && this.activeParams.types.length > 0) {
      const existingTypeInParams = this.activeParams.types.find(item => item === url);
      if (existingTypeInParams && !checked) {
        this.activeParams.types = this.activeParams.types.filter(item => item !== url);
      } else if (!existingTypeInParams && checked) {
        this.activeParams.types = [...this.activeParams.types, url];
      }
    } else if (checked) {
      this.activeParams.types = [url];
    }
    this.router.navigate(['/catalog'], {
      queryParams: this.activeParams
    });
  }

  public updateFilterParamFromTo(param: string, value: string) {
    if (param === SizeVariablesUtil.heightFrom || param === SizeVariablesUtil.heightTo || param === SizeVariablesUtil.diameterFrom || param === SizeVariablesUtil.diameterTo) {
      if (this.activeParams.hasOwnProperty(param) && !value) {
        delete this.activeParams[param as keyof ActiveParamsType];
      } else {
        Object.assign(this.activeParams, {[param as keyof ActiveParamsType]: value});
      }
    }
    this.router.navigate(['/catalog'], {
      queryParams: this.activeParams
    });
  }
}
