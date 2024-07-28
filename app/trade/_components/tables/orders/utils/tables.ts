import Big from "big.js"

import useMarket from "@/providers/market.new"
import { type Order } from "../schema"

export function getOrderProgress(
  order: Order,
  market?: ReturnType<typeof useMarket>,
) {
  const { takerGot, initialGives, initialWants } = order

  const displayDecimals = market?.currentMarket?.base.displayDecimals

  const volumeDecimals = order.isBid
    ? market?.currentMarket?.quote.displayDecimals
    : market?.currentMarket?.base.displayDecimals

  const amountDecimals = order.isBid
    ? market?.currentMarket?.base.displayDecimals
    : market?.currentMarket?.quote.displayDecimals

  const volume = Big(initialGives).toFixed(volumeDecimals)
  const amount = Big(initialWants).toFixed(amountDecimals)

  const filled = Big(takerGot).toFixed(displayDecimals)

  const progress = Math.min(
    Math.round(
      Big(filled)
        .mul(100)
        .div(Big(amount).eq(0) ? 1 : amount)
        .toNumber(),
    ),
    100,
  )

  const progressInPercent = (Number(filled) / Number(volume)) * 100

  return { progress, filled, volume, progressInPercent, amount }
}
