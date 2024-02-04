import {Component, OnInit} from '@angular/core';
import {CategoryService} from "../services/category.service";
import {CategoryWithTypeType} from "../../../types/category-with-type.type";

@Component({
  selector: 'layout',
  templateUrl: './layout.component.html'
})
export class LayoutComponent implements OnInit {

  categories: CategoryWithTypeType[] = [];

  constructor(private categoryService: CategoryService) {
  }

  ngOnInit(): void {
    this.categoryService.getCategoriesWithTypes().subscribe((categories: CategoryWithTypeType[]) => {
      this.categories = categories.map(item => {
        return Object.assign({typesUrl: item.types.map(item => item.url)}, item);
      });
    });
  }

}
