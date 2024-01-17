import {Component, OnInit} from '@angular/core';
import {FormBuilder, Validators} from "@angular/forms";
import {AuthService} from "../../../core/auth/auth.service";
import {HttpErrorResponse} from "@angular/common/http";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {LoginResponseType} from "../../../../types/login-response.type";
import {MatSnackBar} from "@angular/material/snack-bar";
import {SubscriberService} from "../../../shared/services/subscriber.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm = this.fb.group({
    email: ['', [Validators.email, Validators.required]],
    password: ['', [Validators.required]],
    rememberMe: [false]
  })

  constructor(private fb: FormBuilder, private authService: AuthService, private subscriberService: SubscriberService, private _snackBar: MatSnackBar) {
  }

  ngOnInit(): void {
  }

  login(): void {
    this._snackBar.open('ok!')
    if (this.loginForm.valid && this.loginForm.value.email && this.loginForm.value.password) {
      this.authService.login(this.loginForm.value.email, this.loginForm.value.password, !!this.loginForm.value.rememberMe)
        .subscribe({
          next: (data: DefaultResponseType | LoginResponseType) => {
            this.subscriberService.perform(data, 'login')
          },
          error: (errorResponse: HttpErrorResponse) => {
            if (errorResponse.error && errorResponse.error.message) {
              this._snackBar.open(errorResponse.error.message)
            } else {
              this._snackBar.open('Ошибка Авторизации')
            }
          }
        })
    }
  }

}
