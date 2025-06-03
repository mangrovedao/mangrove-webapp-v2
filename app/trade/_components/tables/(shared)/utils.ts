import { Address, isAddressEqual } from "viem"
import { TimeToLiveUnit } from "../../forms/limit/enums"
import { Market, Order, Token } from "./type"

export const findToken = (address: Address, tokens: Token[]) => {
  return tokens.find((token) => isAddressEqual(token.address, address))
}

export function transformOrders(orders: Order[], markets: Market[]) {
  return orders.map((order) => {
    const market = markets.find(
      (market) =>
        BigInt(market.tickSpacing) === BigInt(order.tickSpacing) &&
        ((isAddressEqual(market.base.address, order.sendToken) &&
          isAddressEqual(market.quote.address, order.receiveToken)) ||
          (isAddressEqual(market.base.address, order.receiveToken) &&
            isAddressEqual(market.quote.address, order.sendToken))),
    )

    if (!market) {
      throw new Error("Market not found")
    }

    const isBuy = isAddressEqual(order.receiveToken, market.base.address)

    const side = isBuy ? "buy" : "sell"

    const sent = order?.sent ? order.sent : order?.totalGives ?? 0
    const received = order?.received ? order.received : order.totalWants ?? 0

    const price =
      sent && received ? (isBuy ? sent / received : received / sent) : 0

    return {
      ...order,
      market,
      side,
      price,
    }
  })
}

function getNumberOfSeconds(timeToLiveUnit: `${TimeToLiveUnit}`) {
  let seconds: number
  switch (timeToLiveUnit) {
    case TimeToLiveUnit.DAY:
      seconds = 86400
      break
    case TimeToLiveUnit.HOUR:
      seconds = 3600
      break
    case TimeToLiveUnit.MIN:
      seconds = 60
      break
    default:
      throw new Error("Not implemented")
  }
  return seconds
}

export function estimateTimestamp({
  timeToLiveUnit,
  timeToLive,
}: {
  timeToLiveUnit: `${TimeToLiveUnit}` | null
  timeToLive: string
}) {
  const seconds = getNumberOfSeconds(timeToLiveUnit ?? TimeToLiveUnit.DAY)
  return Math.trunc(Date.now() / 1000 + seconds * parseInt(timeToLive))
}

// Safe date parsing function that handles invalid or missing timestamps
export function safeDate(timestamp: number | undefined | null) {
  // Check if timestamp is valid number and reasonable (after 2010)
  if (timestamp && typeof timestamp === "number" && timestamp > 1262304000) {
    try {
      const date = new Date(timestamp * 1000)
      // Verify the date is valid
      if (!isNaN(date.getTime())) {
        return date
      }
    } catch (e) {
      console.warn("Invalid date parsing", timestamp, e)
    }
  }
  // Return current date as fallback for required date fields
  return new Date()
}
