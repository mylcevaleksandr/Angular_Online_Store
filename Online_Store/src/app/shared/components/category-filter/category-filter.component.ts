import {Component, Input} from '@angular/core';
import {CategoryWithTypeType} from "../../../../types/category-with-type.type";
import {Router} from "@angular/router";
import {ActiveParamsType} from "../../../../types/active-params.type";

@Component({
  selector: 'category-filter',
  templateUrl: './category-filter.component.html',
  styleUrls: ['./category-filter.component.scss']
})
export class CategoryFilterComponent {
  @Input() categoryWithTypes: CategoryWithTypeType | null = null;
  @Input() type: string | null = null;
  public open: boolean = false
  public activeParams: ActiveParamsType = {types: []}

  constructor(private router: Router) {
  }

  public get title(): string {
    if (this.categoryWithTypes) {
      return this.categoryWithTypes.name
    } else if (this.type) {
      if (this.type === 'height') {
        return 'Высота'
      } else if (this.type === 'diameter') {
        return 'Диаметр'
      }
    }
    return ''
  }

  public toggle(): void {
    if (!this.open) {
      this.open = true
    } else {
      this.open = false
    }
  }

  public updateFilterParam(url: string, checked: boolean) {
    if (this.activeParams && this.activeParams.types.length > 0) {
      const existingTypeInParams = this.activeParams.types.find(item => item === url)
      if (existingTypeInParams && !checked) {
        this.activeParams.types = this.activeParams.types.filter(item => item !== url)
      } else if (!existingTypeInParams && checked) {
        this.activeParams.types.push(url)
      }
    } else if (checked) {
      this.activeParams.types = [url]
    }
    this.router.navigate(['/catalog'], {
      queryParams: this.activeParams
    })
  }
}
