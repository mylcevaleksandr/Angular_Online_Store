import {Component, Input, OnInit} from '@angular/core';
import {CategoryType} from "../../../../types/category.type";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss', '../../../../assets/styles/_variables.scss']
})
export class HeaderComponent implements OnInit {
  @Input() categories: CategoryType[] = []

  constructor() {
  }

  ngOnInit(): void {

  }
}
