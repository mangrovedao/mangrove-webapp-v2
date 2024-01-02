type PageDetails = {
  page: number
  pageSize: number
}

declare global {
  type PageDetails = PageDetails
  interface WindowEventMap {
    "on-orderbook-offer-clicked": CustomEvent<{ price: string }>
  }
}

declare module "react-object-view"
