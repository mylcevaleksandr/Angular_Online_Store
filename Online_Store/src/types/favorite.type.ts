export type FavoriteType = {
  id: string,
  name: string,
  url: string,
  image: string,
  price: number,
  isInCart?: boolean,
  amount?:number
}
