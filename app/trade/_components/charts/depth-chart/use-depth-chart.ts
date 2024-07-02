import Big from "big.js"
import React from "react"

import { useBook } from "@/hooks/use-book"
import useMarket from "@/providers/market.new"
import { clamp } from "@/utils/interpolation"
import type { CompleteOffer } from "@mangrovedao/mgv"
import { calculateCumulative } from "./utils"

function enablePageScroll() {
  document.body.classList.remove("overflow-hidden")
}

function disablePageScroll() {
  document.body.classList.add("overflow-hidden")
}

function removeCrossedOrders(
  bids: CompleteOffer[],
  asks: CompleteOffer[],
): { bids: CompleteOffer[]; asks: CompleteOffer[] } {
  for (let i = 0, j = 0; i < bids.length && j < asks.length; ) {
    const comparison = Big(bids?.[i]?.price ?? 0).cmp(asks?.[j]?.price ?? 0)

    if (comparison === -1) {
      break
    } else if (comparison === 0) {
      bids.splice(i, 1)
      asks.splice(j, 1)
    } else {
      asks.splice(j, 1)
    }
  }

  return { bids, asks }
}

export function useDepthChart() {
  const { currentMarket: market } = useMarket()
  const { book, isLoading } = useBook({})
  const [hasScrolled, setHasScrolled] = React.useState(false)
  const [isScrolling, setIsScrolling] = React.useState(false)
  const [zoomDomain, setZoomDomain] = React.useState<undefined | number>()
  const baseDecimals = market?.base.displayDecimals
  const priceDecimals = market?.quote.priceDisplayDecimals
  const { asks, bids } = removeCrossedOrders(book?.bids ?? [], book?.asks ?? [])
  const cumulativeAsks = calculateCumulative(asks, true)
  const cumulativeBids = calculateCumulative(bids)
  const lowestAsk = asks?.[0]
  const highestBid = bids?.[0]
  const lowestBid = bids?.[bids.length - 1]
  const highestAsk = asks?.[asks.length - 1]
  const midPrice = React.useMemo(() => {
    if (!bids?.length || !asks?.length) return 0
    return ((lowestAsk?.price ?? 0) + (highestBid?.price ?? 0)) / 2
  }, [asks?.length, bids?.length, highestBid?.price, lowestAsk?.price])

  const OFFSET_FOR_ZOOM = Math.min(2, asks.length - 1, bids.length - 1)
  const MAX_RATIO_PER_STEP = 2

  // Sum up the asks and bids to get a cumulative volume array
  const { cumulativeAsksForZoom, cumulativeBidsForZoom } = React.useMemo(() => {
    const cumulativeAsksForZoom = asks.reduce((acc, off) => {
      acc.push(off.volume + (acc.slice(-1)[0] ?? 0))
      return acc
    }, [] as number[])

    const cumulativeBidsForZoom = bids.reduce((acc, off) => {
      acc.push(off.volume + (acc.slice(-1)[0] ?? 0))
      return acc
    }, [] as number[])

    return { cumulativeBidsForZoom, cumulativeAsksForZoom }
  }, [market?.base.address, market?.quote.address, asks.length, bids.length])

  const { maxDiff } = React.useMemo(() => {
    let bidIndex = OFFSET_FOR_ZOOM
    let askIndex = OFFSET_FOR_ZOOM

    for (let i = OFFSET_FOR_ZOOM; i < cumulativeBidsForZoom.length - 2; i++) {
      if (
        cumulativeBidsForZoom[i + 1]! >
        cumulativeBidsForZoom[i]! * MAX_RATIO_PER_STEP
      ) {
        bidIndex = i
        break
      }
    }

    if (bidIndex === OFFSET_FOR_ZOOM) {
      bidIndex = cumulativeBidsForZoom.length - 1
    }

    for (let i = OFFSET_FOR_ZOOM; i < cumulativeAsksForZoom.length - 2; i++) {
      if (
        cumulativeAsksForZoom[i + 1]! >
        cumulativeAsksForZoom[i]! * MAX_RATIO_PER_STEP
      ) {
        askIndex = i
        break
      }
    }

    if (askIndex === OFFSET_FOR_ZOOM) {
      askIndex = cumulativeAsksForZoom.length - 1
    }

    const bidDiff = midPrice - bids[bidIndex]?.price!
    const askDiff = asks[askIndex]?.price! - midPrice
    const maxDiff = Math.max(bidDiff, askDiff) ?? 0
    return { maxDiff }
  }, [market?.base.address, market?.quote.address, asks.length, bids.length])

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
    return ((midPrice ?? 0) - (highestBid?.price ?? 0)) * 1.15
  }, [highestBid?.price, midPrice])

  const { domain, range } = React.useMemo(() => {
    const domain =
      !asks?.length || !bids?.length
        ? [
            !asks?.length ? 0 : Big(lowestAsk?.price ?? 0).toNumber(),
            !asks?.length
              ? Big(highestBid?.price ?? 0).toNumber()
              : Big(highestAsk?.price ?? 0)
                  .times(1.1)
                  .toNumber(), // Add 10% to the highest ask
          ]
        : ([
            clamp(
              midPrice - (zoomDomain ?? 0),
              (lowestBid?.price ?? 0) * 0.9, // Subtract 10% from the lowest bid
              highestBid?.price ?? 0,
            ),
            clamp(
              midPrice + (zoomDomain ?? 0),
              lowestAsk?.price ?? 0,
              (highestAsk?.price ?? 0) * 1.1, // Add 10% to the highest ask
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
        .map((offer) => offer.volume)
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
    lowestBid?.price,
    midPrice,
    zoomDomain,
  ])

  React.useEffect(() => {
    // Handle one-side orderbook
    if (!asks?.length || !bids?.length) {
      setZoomDomain(
        !asks?.length ? highestBid?.price ?? 0 : highestAsk?.price ?? 0,
      )
      return
    }

    setZoomDomain(maxDiff)
  }, [
    asks?.length,
    bids?.length,
    highestAsk?.price,
    highestBid?.price,
    lowestBid?.price,
    midPrice,
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

    if (!hasScrolled) {
      setHasScrolled(true)
    }

    // Thoughts? Messy or easier to follow?
    // easier now, it's the same but on many lines, right?
    // Should be the exact same, but I might have messed up the math, will double check
    // that's what I was trying to understand / check, seems to be the same, need to do git diff :)
    let newDomain = zoomDomain * Math.exp(deltaY / 1000)
    newDomain = Math.min(Number.MAX_SAFE_INTEGER, newDomain)
    newDomain = Math.max(1e-18, newDomain, minZoomDomain)
    newDomain = clamp(newDomain, 0, midPrice)
    setZoomDomain(newDomain)
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
    market,
    asks,
    bids,
    isLoading,
  }
}
