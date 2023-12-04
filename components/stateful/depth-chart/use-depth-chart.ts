import { type Market } from "@mangrovedao/mangrove.js"
import Big from "big.js"
import React from "react"

import useMarket from "@/providers/market"
import { clamp } from "@/utils/interpolation"
import { calculateCumulative } from "./utils"

function enablePageScroll() {
  document.body.classList.remove("overflow-hidden")
}

function disablePageScroll() {
  document.body.classList.add("overflow-hidden")
}

function removeCrossedOrders(
  bids: Market.Offer[],
  asks: Market.Offer[],
): { bids: Market.Offer[]; asks: Market.Offer[] } {
  // Sort bids and asks by price (descending for bids, ascending for asks)
  bids.sort((a, b) =>
    Big(b.price ?? 0)
      .minus(a.price ?? 0)
      .toNumber(),
  )
  asks.sort((a, b) =>
    Big(a.price ?? 0)
      .minus(b.price ?? 0)
      .toNumber(),
  )

  const i = 0
  const j = 0

  // Iterate through bids and asks
  while (i < bids.length && j < asks.length) {
    const bid = bids[i]
    const ask = asks[j]

    // Compare bid and ask prices
    const comparison = Big(bid?.price ?? 0).cmp(ask?.price ?? 0)

    if (comparison === -1) {
      // Bid price is less than ask price, no more crossed orders
      break
    } else if (comparison === 0) {
      // Bid and ask prices are equal, remove both orders
      bids.splice(i, 1)
      asks.splice(j, 1)
    } else {
      // Bid price is greater than ask price, remove the ask order
      asks.splice(j, 1)
    }
  }

  // Return the updated bids and asks arrays
  return { bids, asks }
}

export function useDepthChart() {
  const { requestBookQuery, selectedMarket } = useMarket()
  const [zoomDomain, setZoomDomain] = React.useState<undefined | number>()
  const [isScrolling, setIsScrolling] = React.useState(false)
  const baseDecimals = selectedMarket?.base.decimals
  const priceDecimals = selectedMarket?.quote.displayedAsPriceDecimals
  const { asks, bids } = removeCrossedOrders(
    requestBookQuery.data?.bids ?? [],
    requestBookQuery.data?.asks ?? [],
  )
  const isLoading = requestBookQuery.isLoading
  const cumulativeAsks = calculateCumulative(asks)
  const cumulativeBids = calculateCumulative(bids)
  const lowestAsk = asks?.[0]
  const highestBid = bids?.[0]
  const lowestBid = bids?.[bids.length - 1]
  const highestAsk = asks?.[asks.length - 1]
  const midPrice = React.useMemo(() => {
    if (!bids?.length || !asks?.length) return Big(0)
    return Big(lowestAsk?.price ?? 0)
      .add(highestBid?.price ?? 0)
      .div(2)
  }, [asks?.length, bids?.length, highestBid?.price, lowestAsk?.price])

  function onMouseOut() {
    setIsScrolling(false)
    enablePageScroll()
  }

  function onMouseOver() {
    setIsScrolling(true)
    disablePageScroll()
  }

  function onMouseMove() {
    setIsScrolling(false)
  }

  const minZoomDomain = React.useMemo(() => {
    return Big(midPrice ?? 0)
      .minus(highestBid?.price ?? 0)
      .mul(1.15)
      .toNumber()
  }, [highestBid?.price, midPrice])

  React.useEffect(() => {
    // Handle one-side orderbook
    if (!asks?.length || !bids?.length) {
      setZoomDomain(
        !asks?.length
          ? Big(highestBid?.price ?? 0).toNumber()
          : Big(highestAsk?.price ?? 0).toNumber(),
      )
      return
    }
    // set initial zoom domain
    const midPriceAsBig = Big(midPrice ?? 0)
    const higestBidAsBig = Big(highestBid?.price ?? 0)
    const lowestBidAsBig = Big(lowestBid?.price ?? 0)
    const highestAskAsBig = Big(highestAsk?.price ?? 0)
    const newZoomDomain = Math.max(
      midPriceAsBig.minus(higestBidAsBig).mul(13).toNumber(),
      midPriceAsBig.minus(lowestBidAsBig).div(2).toNumber(),
      Big(highestAskAsBig).minus(midPriceAsBig).div(2).toNumber(),
    )

    setZoomDomain(
      newZoomDomain > midPrice.toNumber() ? midPrice.toNumber() : newZoomDomain,
    )
  }, [
    asks?.length,
    bids?.length,
    highestAsk?.price,
    highestBid?.price,
    lowestBid?.price,
    midPrice,
  ])

  const { domain, range } = React.useMemo(() => {
    const domain =
      !asks?.length || !bids?.length
        ? [
            !asks?.length ? 0 : Big(lowestAsk?.price ?? 0).toNumber(),
            !asks?.length
              ? Big(highestBid?.price ?? 0).toNumber()
              : Big(highestAsk?.price ?? 0).toNumber(),
          ]
        : ([
            clamp(
              midPrice.minus(zoomDomain ?? 0).toNumber(),
              0,
              Big(highestBid?.price ?? 0).toNumber(),
            ),
            clamp(
              midPrice.plus(zoomDomain ?? 0).toNumber(),
              Big(lowestAsk?.price ?? 0).toNumber(),
              Big(highestAsk?.price ?? 0).toNumber(),
            ),
          ] as const)

    const range = [
      0,
      [...cumulativeBids, ...cumulativeAsks]
        .filter(
          (offer) =>
            Big(offer?.price ?? 0).gte(domain[0]) &&
            Big(offer?.price ?? 0).lte(domain[1]),
        )
        .map((offer) => offer.volume.toNumber())
        .reduce((a, b) => Math.max(a, b), 0),
    ] as const

    return { domain, range }
  }, [
    asks?.length,
    bids?.length,
    cumulativeAsks,
    cumulativeBids,
    highestAsk?.price,
    highestBid?.price,
    lowestAsk?.price,
    midPrice,
    zoomDomain,
  ])

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
          minZoomDomain,
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
    lowestAsk,
    highestBid,
    isScrolling,
    setIsScrolling,
    onMouseOut,
    onMouseOver,
    onMouseMove,
    baseDecimals,
    priceDecimals,
    selectedMarket,
    asks,
    bids,
    isLoading,
  }
}
