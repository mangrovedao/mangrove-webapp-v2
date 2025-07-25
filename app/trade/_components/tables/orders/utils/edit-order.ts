import Big from "big.js"

import { Token } from "@mangrovedao/mgv"
import { Order } from "../../(shared)/schema"

export function getOrderProgress(
  order: Order,
  baseToken?: Token,
  quoteToken?: Token,
) {
  const { takerGot, initialGives, initialWants, side } = order
  const isBid = side === "buy"

  const volumeDecimals = isBid
    ? quoteToken?.displayDecimals
    : baseToken?.displayDecimals

  const amountDecimals = isBid
    ? baseToken?.displayDecimals
    : quoteToken?.displayDecimals

  const gives = Big(initialGives ?? 0).toFixed(volumeDecimals ?? 0)
  const wants = Big(initialWants ?? 0).toFixed(amountDecimals ?? 0)

  const filled = Big(takerGot).toFixed(baseToken?.displayDecimals)

  const progress = Math.min(
    Math.round(
      Big(filled)
        .mul(100)
        .div(Big(wants).eq(0) ? 1 : wants)
        .toNumber(),
    ),
    100,
  )

  const progressInPercent = (Number(filled) / Number(gives)) * 100

  return { progress, filled, gives, progressInPercent, wants }
}
