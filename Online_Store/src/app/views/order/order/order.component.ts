import {Component, OnInit} from '@angular/core';
import {ProductService} from "../../../shared/services/product.service";
import {CartService} from "../../../shared/services/cart.service";
import {CartType} from "../../../../types/cart.type";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {environment} from "../../../../environments/environment";
import {CalculateCartTotalUtil} from "../../../shared/utils/calculate-cart-total.util";
import {Router} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";
import {DeliveryType} from "../../../../types/delivery.type";
import {FormBuilder, Validators} from "@angular/forms";
import {PaymentType} from "../../../../types/payment.type";

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
})
export class OrderComponent implements OnInit {
  public deliveryType: DeliveryType = DeliveryType.delivery;
  public deliveryTypes = DeliveryType;
  public paymentTypes = PaymentType;
  private cart: CartType | null = null;
  public serverStaticPath = environment.serverStaticPath;
  public totalAmount: number = 0;
  public totalCount: number = 0;
  public orderForm = this.fb.group(
    {
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      fatherName: [''],
      phone: ['', Validators.required],
      paymentType: [PaymentType.cardOnline, Validators.required],
      email: ['', [Validators.required, Validators.email]],
      street: [''],
      house: [''],
      entrance: [''],
      apartment: [''],
      comment: ['']
    }
  );

  constructor(private productService: ProductService,
              private cartService: CartService,
              private _snackBar: MatSnackBar,
              private fb: FormBuilder,
              private router: Router) {
    this.updateDeliveryTypeValidation();
  }

  ngOnInit(): void {

    this.cartService.getCart().subscribe((data: CartType | DefaultResponseType) => {
      if ((data as DefaultResponseType).error !== undefined) {
        throw new Error((data as DefaultResponseType).message);
      }
      this.cart = data as CartType;
      if (!this.cart || (this.cart && this.cart.items.length === 0)) {
        this._snackBar.open('В корзине нет товаров, нечего оформлять.');
        this.router.navigate(["/"]);
        return;
      }
      CalculateCartTotalUtil.calculateTotal(this);
    });
  }

  public changeDeliveryType(deliveryType: DeliveryType): void {
    this.deliveryType = deliveryType;
    this.updateDeliveryTypeValidation();
  }

  private updateDeliveryTypeValidation() {
    if (this.deliveryType == DeliveryType.delivery) {
      this.orderForm.get('street')?.setValidators(Validators.required);
      this.orderForm.get('house')?.setValidators(Validators.required);
    } else {
      this.orderForm.get('street')?.removeValidators(Validators.required);
      this.orderForm.get('house')?.removeValidators(Validators.required);
      this.orderForm.get('street')?.setValue('');
      this.orderForm.get('house')?.setValue('');
      this.orderForm.get('entrance')?.setValue('');
      this.orderForm.get('apartment')?.setValue('');
    }
    this.orderForm.get('street')?.updateValueAndValidity();
    this.orderForm.get('house')?.updateValueAndValidity();
  }

  public createOrder(): void {
    console.log(this.orderForm.value);
    console.log(this.orderForm.valid);
  }
}
