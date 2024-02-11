export class CalculateCartTotalUtil {
  static calculateTotal(that: any): void {
    that.totalAmount = 0;
    that.totalCount = 0;
    if (that.cart) {
      that.cart.items.forEach((item: any) => {
        that.totalAmount += item.quantity * item.product.price;
        that.totalCount += item.quantity;
      });
    }
  }
}
