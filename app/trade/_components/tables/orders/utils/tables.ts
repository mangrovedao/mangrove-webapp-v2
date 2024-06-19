import Big from "big.js"

import useMarket from "@/providers/market.new"
import { AmplifiedOrder, type Order } from "../schema"

export function getOrderProgress(
  order: Order,
  market?: ReturnType<typeof useMarket>,
) {
  const { takerGot, initialGives, initialWants } = order

  const displayDecimals = market?.currentMarket?.base.displayDecimals
  const volume = Big(initialGives).toFixed(displayDecimals)
  const amount = Big(initialWants).toFixed(displayDecimals)

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

export function getAmplifiedOrderProgress(
  order: AmplifiedOrder,
  market?: ReturnType<typeof useMarket>,
) {
  // const { takerGot, initialGives, initialWants } = order
  // const displayDecimals = market?.base.displayedDecimals
  // const volume = Big(initialGives).toFixed(displayDecimals)
  // const amount = Big(initialWants).toFixed(displayDecimals)
  // const filled = Big(takerGot).toFixed(displayDecimals)
  // const progress = Math.min(
  //   Math.round(
  //     Big(filled)
  //       .mul(100)
  //       .div(Big(volume).eq(0) ? 1 : volume)
  //       .toNumber(),
  //   ),
  //   100,
  // )
  // const progressInPercent = (Number(filled) / Number(volume)) * 100
  // return { progress, filled, volume, progressInPercent, amount }
}
