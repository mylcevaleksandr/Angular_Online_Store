import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'count-selector',
  templateUrl: './count-selector.component.html',
  styleUrls: ['./count-selector.component.scss']
})
export class CountSelectorComponent {
  @Input() count: number = 1;

  @Output() onCountChange: EventEmitter<number> = new EventEmitter<number>();


  public countChange(): void {
    this.onCountChange.emit(this.count);
  }

  public decreaseCount(): void {
    this.count > 1 ? this.count-- : this.count;
    this.countChange();
  }

  public increaseCount(): void {
    this.count++;
    this.countChange();
  }
}

