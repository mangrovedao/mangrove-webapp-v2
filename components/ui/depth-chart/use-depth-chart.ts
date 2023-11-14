import React from "react"

import { clamp } from "@/utils/interpolation"
import { orderbookSchema } from "./schema"
import { calculateCumulative } from "./utils"

import Big from "big.js"
import mock from "./mock.json"

const { asks, bids } = orderbookSchema.parse(mock)

const cumulativeAsks = calculateCumulative(asks)
const cumulativeBids = calculateCumulative(bids)
const lowestAsk = asks[0]
const highestBid = bids[0]
const lowestBid = bids[bids.length - 1]
const highestAsk = asks[asks.length - 1]
let midPrice = lowestAsk?.price.add(highestBid?.price ?? 0).div(2)
if (!midPrice) midPrice = Big(28000)

export function useDepthChart() {
  const [zoomDomain, setZoomDomain] = React.useState<undefined | number>()

  React.useEffect(() => {
    if (!midPrice) {
      setZoomDomain(undefined)
    } else if (!zoomDomain && lowestBid && highestAsk) {
      setZoomDomain(
        Math.min(
          midPrice.mul(0.15).toNumber(),
          midPrice.minus(lowestBid.price).div(2).toNumber(),
          highestAsk.price.minus(midPrice).div(2).toNumber(),
        ),
      )
    }
  }, [zoomDomain])

  const { domain, range } = React.useMemo(() => {
    if (
      !(
        zoomDomain &&
        midPrice &&
        asks.length &&
        bids.length &&
        highestBid &&
        highestAsk &&
        lowestAsk &&
        lowestBid
      )
    )
      return { domain: [0, 0] as const, range: [0, 0] as const }

    const domain = [
      clamp(
        midPrice.minus(zoomDomain).toNumber(),
        0,
        highestBid.price.toNumber(),
      ),
      clamp(
        midPrice.plus(zoomDomain).toNumber(),
        lowestAsk.price.toNumber(),
        highestAsk.price.toNumber(),
      ),
    ] as const

    const range = [
      0,
      [...cumulativeBids, ...cumulativeAsks]
        .filter(
          (offer) => offer.price.gte(domain[0]) && offer.price.lte(domain[1]),
        )
        .map((offer) => offer.volume.toNumber())
        .reduce((a, b) => Math.max(a, b), 0),
    ] as const

    return { domain, range }
  }, [zoomDomain])

  console.log({ domain, midPrice })

  const onDepthChartZoom = ({ deltaY }: React.WheelEvent) => {
    if (
      !(
        zoomDomain &&
        midPrice &&
        lowestAsk &&
        lowestBid &&
        highestAsk &&
        highestBid
      )
    )
      return

    setZoomDomain(
      clamp(
        Math.max(
          1e-18,
          Math.min(
            Number.MAX_SAFE_INTEGER,
            zoomDomain * Math.exp(deltaY / 1000),
          ),
        ),
        0,
        midPrice.toNumber(),
      ),
    )
  }
  return {
    zoomDomain,
    onDepthChartZoom,
    cumulativeAsks,
    cumulativeBids,
    domain,
    range,
    midPrice,
    highestAsk,
    lowestAsk,
    highestBid,
    lowestBid,
  }
}
