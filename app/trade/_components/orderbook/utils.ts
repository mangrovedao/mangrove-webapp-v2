import { CompleteOffer } from "@mangrovedao/mgv"

export type Data = {
  asks: CompleteOffer[]
  bids: CompleteOffer[]
}

type OffersWithCumulative = [CompleteOffer & { cumulatedVolume?: number }]

export function calculateCumulatedVolume(data: Data | null | undefined) {
  const asks = [...(data?.asks ?? [])] as OffersWithCumulative
  const bids = [...(data?.bids ?? [])] as OffersWithCumulative
  let cumulatedAsksVolume = 0
  let cumulatedBidsVolume = 0

  // Calculate cumulated volume for asks (from lowest to highest price)
  for (const ask of asks) {
    cumulatedAsksVolume = cumulatedAsksVolume + ask.volume * ask.price
    ask.cumulatedVolume = cumulatedAsksVolume
  }

  // Calculate cumulated volume for bids (from highest to lowest price)
  for (const bid of bids) {
    cumulatedBidsVolume = cumulatedBidsVolume + bid.volume * bid.price
    bid.cumulatedVolume = cumulatedBidsVolume
  }

  return {
    dataWithCumulatedVolume: { asks, bids },
    maxVolume: Math.max(cumulatedAsksVolume, cumulatedBidsVolume),
  }
}
