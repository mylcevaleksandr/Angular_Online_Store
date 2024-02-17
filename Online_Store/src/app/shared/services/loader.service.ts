import {Injectable} from '@angular/core';
import {Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  public isShowed$: Subject<boolean> = new Subject<boolean>();

  constructor() {
  }

  public show() {
    this.isShowed$.next(true);
  }

  public hide() {
    this.isShowed$.next(false);
  }


}
