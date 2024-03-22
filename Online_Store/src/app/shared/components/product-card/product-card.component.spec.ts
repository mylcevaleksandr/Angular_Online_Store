import {ProductCardComponent} from "./product-card.component";
import {ComponentFixture, TestBed} from "@angular/core/testing";
import {CartService} from "../../services/cart.service";
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "../../../core/auth/auth.service";
import {RepeatedCodeService} from "../../services/repeatedCode.service";
import {of} from "rxjs";
import {ProductType} from "../../../../types/product.type";
import {CountSelectorComponent} from "../count-selector/count-selector.component";
import {NO_ERRORS_SCHEMA} from "@angular/core";

describe('product card', () => {
  let productCardComponent: ProductCardComponent;
  let fixture: ComponentFixture<ProductCardComponent>;
  let product: ProductType;
  beforeEach(() => {
    const cartServiceSpy = jasmine.createSpyObj('CartService', ['updateCart']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getIsLoggedIn']);
    const RepeatedCodeServiceSpy = jasmine.createSpyObj('RepeatedCodeService', ['updateFavorite']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [],
      declarations: [ProductCardComponent, CountSelectorComponent],
      providers: [
        {provide: CartService, useValue: cartServiceSpy},
        {provide: AuthService, useValue: authServiceSpy},
        {provide: RepeatedCodeService, useValue: RepeatedCodeServiceSpy},
        {provide: Router, useValue: routerSpy},
        {provide: ActivatedRoute, useValue: {snapshot: {params: {id: '24fkzrw3487943uf358lovd'}}}}
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(ProductCardComponent);
    productCardComponent = fixture.componentInstance;
    product = {
      id: 'test',
      name: 'test',
      price: 1,
      image: 'test',
      lightning: 'test',
      humidity: 'test',
      temperature: 'test',
      height: 1,
      diameter: 1,
      url: 'test',
      type: {
        id: 'test',
        name: 'test',
        url: 'test'
      }
    };
    productCardComponent.product = product;
  });

  it('should have count init value 1', function () {
    expect(productCardComponent.count).toBe(1);
  });

  it('should set value from input countInCart to count', () => {
    productCardComponent.countInCart = 5;
    fixture.detectChanges();
    expect(productCardComponent.count).toBe(5);
  });

  it('should call removeFromCart with count 0', function () {
    let cartServiceSpy = TestBed.inject(CartService) as jasmine.SpyObj<CartService>;
    cartServiceSpy.updateCart.and.returnValue(of({
        items: [
          {
            product: {
              id: '1',
              name: '1',
              url: '1',
              image: '1',
              price: 1
            },
            quantity: 1
          }
        ]
      }
    ));
    productCardComponent.removeFromCart();
    expect(cartServiceSpy.updateCart).toHaveBeenCalledOnceWith(product.id, 0);
  });
  it('should hide product-card-info and product-card-extra if it is light card', (done: DoneFn) => {
    productCardComponent.isLight = true;
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      const componentElement: HTMLElement = fixture.nativeElement;
      const productCardInfo: HTMLElement | null = componentElement.querySelector('.product-card-info');
      const productCardExtra: HTMLElement | null = componentElement.querySelector('.product-card-extra');
      expect(productCardInfo).toBe(null);
      expect(productCardExtra).toBe(null);
      done();
    });
  });
  it('should call navigate for light card', function () {
    let routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    productCardComponent.isLight = true;
    productCardComponent.lightCardRedirect();
    expect(routerSpy.navigate).toHaveBeenCalled();

  });
  it('should not call navigate for full card', function () {
    let routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    productCardComponent.isLight = false;
    productCardComponent.lightCardRedirect();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });
});
