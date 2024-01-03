import { type Market } from "@mangrovedao/mangrove.js"
import Big from "big.js"

import { type Order } from "../schema"

export function getOrderProgress(order: Order, market?: Market) {
  const { isBid, takerGot, takerGave, initialWants, initialGives } = order

  const displayDecimals = market?.base.displayedDecimals
  const amount = Big(isBid ? initialWants : initialGives).toFixed(
    displayDecimals,
  )

  const filled = Big(isBid ? takerGot : takerGave).toFixed(displayDecimals)

  const progress = Math.min(
    Math.round(
      Big(filled)
        .mul(100)
        .div(Big(amount).eq(0) ? 1 : amount)
        .toNumber(),
    ),
    100,
  )

  const progressInPercent = (Number(filled) / Number(amount)) * 100

  return { progress, filled, amount, progressInPercent }
}
