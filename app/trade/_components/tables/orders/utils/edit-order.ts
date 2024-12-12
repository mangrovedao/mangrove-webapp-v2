import Big from "big.js"

import { Token } from "@mangrovedao/mgv"
import { type Order } from "../schema"

export function getOrderProgress(
  order: Order,
  baseToken?: Token,
  quoteToken?: Token,
) {
  const { received, total, side, sent } = order
  const isBid = side === "buy"

  const volumeDecimals = isBid
    ? quoteToken?.displayDecimals
    : baseToken?.displayDecimals

  const amountDecimals = isBid
    ? baseToken?.displayDecimals
    : quoteToken?.displayDecimals

  const gives = sent.toFixed(volumeDecimals)
  const wants = total.toFixed(amountDecimals)

  const filled = received.toFixed(baseToken?.displayDecimals)

  const progress = Math.min(
    Math.round(
      Big(filled)
        .mul(100)
        .div(Big(wants).eq(0) ? 1 : wants)
        .toNumber(),
    ),
    100,
  )

  const progressInPercent = (Number(filled) / Number(sent)) * 100

  return { progress, filled, gives, progressInPercent, wants }
}
