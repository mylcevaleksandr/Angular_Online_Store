import {Component, ElementRef, OnInit, TemplateRef, ViewChild} from '@angular/core';
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
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {OrderService} from "../../../shared/services/order.service";
import {OrderType} from "../../../../types/order.type";
import {HttpErrorResponse} from "@angular/common/http";
import {UserService} from "../../../shared/services/user.service";
import {UserInfoType} from "../../../../types/user-info.type";
import {AuthService} from "../../../core/auth/auth.service";

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
  @ViewChild('popup') popup!: TemplateRef<ElementRef>;
  public dialogRef: MatDialogRef<any> | null = null;

  constructor(private productService: ProductService,
              private cartService: CartService,
              private orderService: OrderService,
              private _snackBar: MatSnackBar,
              private fb: FormBuilder,
              private dialog: MatDialog,
              private userService: UserService,
              private authService: AuthService,
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
    if (this.authService.getIsLoggedIn()) {
      this.userService.getUserInfo().subscribe((data: UserInfoType | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }
        const userInfo: UserInfoType = data as UserInfoType;

        const paramsToUpdate = {
          firstName: userInfo.firstName ? userInfo.firstName : '',
          lastName: userInfo.lastName ? userInfo.lastName : '',
          fatherName: userInfo.fatherName ? userInfo.fatherName : '',
          phone: userInfo.phone ? userInfo.phone : '',
          paymentType: userInfo.paymentType ? userInfo.paymentType : PaymentType.cardOnline,
          email: userInfo.email ? userInfo.email : '',
          street: userInfo.street ? userInfo.street : '',
          house: userInfo.house ? userInfo.house : '',
          entrance: userInfo.entrance ? userInfo.entrance : '',
          apartment: userInfo.apartment ? userInfo.apartment : '',
          comment: ''
        };
        if (userInfo.deliveryType) {
          this.deliveryType = userInfo.deliveryType;
        }
        this.orderForm.setValue(paramsToUpdate);
      });
    }
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
    if (this.orderForm.valid && this.orderForm.value.firstName && this.orderForm.value.lastName && this.orderForm.value.email && this.orderForm.value.phone && this.orderForm.value.paymentType) {
      const paramsObject: OrderType = {
        deliveryType: this.deliveryType,
        firstName: this.orderForm.value.firstName,
        lastName: this.orderForm.value.lastName,
        email: this.orderForm.value.email,
        phone: this.orderForm.value.phone,
        paymentType: this.orderForm.value.paymentType,
      };
      if (this.deliveryType === DeliveryType.delivery) {
        if (this.orderForm.value.street) {
          paramsObject.street = this.orderForm.value.street;
        }
        if (this.orderForm.value.house) {
          paramsObject.house = this.orderForm.value.house;
        }
        if (this.orderForm.value.apartment) {
          paramsObject.apartment = this.orderForm.value.apartment;
        }
        if (this.orderForm.value.entrance) {
          paramsObject.entrance = this.orderForm.value.entrance;
        }
      }
      if (this.orderForm.value.comment) {
        paramsObject.comment = this.orderForm.value.comment;
      }
      this.orderService.createOrder(paramsObject).subscribe({
        next: (data: OrderType | DefaultResponseType) => {
          if ((data as DefaultResponseType).error !== undefined) {
            throw new Error((data as DefaultResponseType).message);
          }
          this.dialogRef = this.dialog.open(this.popup);
          this.dialogRef.backdropClick().subscribe(() => {
            this.router.navigate(["/"]);
          });
          this.cartService.setCount(0);
        },
        error: (errorResponse: HttpErrorResponse) => {
          if (errorResponse.error && errorResponse.error.message) {
            this._snackBar.open(errorResponse.error.message);
          } else {
            this._snackBar.open('Ошибка отправки заказа');
          }
        }
      });

    } else {
      this.orderForm.markAllAsTouched();
      this._snackBar.open("Заполните все необходимые поля");
    }
  }

  public closePopup() {
    this.dialogRef?.close();
    this.router.navigate(["/"]);
  }
}
