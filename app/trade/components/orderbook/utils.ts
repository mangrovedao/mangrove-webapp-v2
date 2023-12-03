import { type Market } from "@mangrovedao/mangrove.js"
import Big from "big.js"

type Data = {
  asks: Market.Offer[]
  bids: Market.Offer[]
}

type OffersWithCumulative = [Market.Offer & { cumulatedVolume?: Big }]

export function calculateCumulatedVolume(data: Data | null | undefined) {
  const asks = [...(data?.asks ?? [])] as OffersWithCumulative
  const bids = [...(data?.bids ?? [])] as OffersWithCumulative
  let cumulatedAsksVolume = Big(0)
  let cumulatedBidsVolume = Big(0)

  // Calculate cumulated volume for asks (from lowest to highest price)
  for (const ask of asks) {
    cumulatedAsksVolume = cumulatedAsksVolume.add(
      Big(ask.price ?? 0).mul(ask.volume ?? 0),
    )
    ask.cumulatedVolume = cumulatedAsksVolume
  }

  // Calculate cumulated volume for bids (from highest to lowest price)
  for (const bid of bids) {
    cumulatedBidsVolume = cumulatedBidsVolume.add(
      Big(bid.price ?? 0).mul(bid.volume ?? 0),
    )
    bid.cumulatedVolume = cumulatedBidsVolume
  }

  return {
    dataWithCumulatedVolume: { asks, bids },
    maxVolume: Math.max(
      cumulatedAsksVolume.toNumber(),
      cumulatedBidsVolume.toNumber(),
    ),
  }
}
