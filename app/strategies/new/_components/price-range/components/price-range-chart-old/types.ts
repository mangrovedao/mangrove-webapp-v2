export type MergedOffers = {
  offerType: string
  base: Big
  quote: Big
  live?: boolean
  offerId?: number
  price?: Big
}[]
