"use client"
import { type Market } from "@mangrovedao/mangrove.js"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import React from "react"

import { TokenInput } from "@/components/token-input"
import withClientOnly from "@/hocs/withClientOnly"
import useMarket from "@/providers/market"
import { getTokenPriceInToken } from "@/services/tokens.service"
import { cn } from "@/utils"
import { useTokensFromQueryParams } from "../../_hooks/use-tokens-from-query-params"
import { AverageReturn } from "./components/average-return"
import { LiquiditySource } from "./components/liquidity-source"
import { PriceRangeChart } from "./components/price-chart/price-range-chart"
import { RiskAppetite } from "./components/risk-appetite"

const calculateGeometricKandelDistribution = (
  minPrice: string,
  maxPrice: string,
  midPrice: string,
  bids: Market.Offer[],
  asks: Market.Offer[],
): {
  bids: {
    price: Big
    index: number
    gives: Big
    tick: number
  }[]
  asks: {
    price: Big
    index: number
    gives: Big
    tick: number
  }[]
} => {
  const minPriceNumber = Number(minPrice)
  const maxPriceNumber = Number(maxPrice)
  let midPriceNumber = Number(midPrice)
  const numOffers = 5
  const priceStep = (maxPriceNumber - minPriceNumber) / (numOffers - 1)
  const dBids: {
    price: Big
    index: number
    gives: Big
    tick: number
  }[] = []
  const dAsks: {
    price: Big
    index: number
    gives: Big
    tick: number
  }[] = []

  if (!midPriceNumber && bids.length > 0 && asks.length > 0) {
    const highestBid = Math.max(...bids.map((bid) => Number(bid.price)))
    const lowestAsk = Math.min(...asks.map((ask) => Number(ask.price)))
    midPriceNumber = (highestBid + lowestAsk) / 2
  }

  for (let i = 0; i < numOffers; i++) {
    const tick = i * priceStep
    const price = new Big(minPriceNumber + tick)
    const offer = {
      index: i,
      gives: new Big(0), // replace with the correct value
      tick: tick, // use the calculated tick value
      price: price, // use the calculated price value
    }

    if (price.lt(midPriceNumber)) {
      dBids.push(offer)
    } else {
      dAsks.push(offer)
    }
  }

  return {
    bids: dBids,
    asks: dAsks,
  }
}

export const PriceRange = withClientOnly(function ({
  className,
}: {
  className?: string
}) {
  const { baseToken, quoteToken } = useTokensFromQueryParams()
  const baseSymbol = baseToken?.symbol
  const quoteSymbol = quoteToken?.symbol
  const { requestBookQuery } = useMarket()

  // Get mid price only if there is no liquidity in the book
  const midPriceQuery = useQuery({
    queryKey: ["midPrice", baseSymbol, quoteSymbol],
    queryFn: () => {
      if (!baseSymbol || !quoteSymbol) return undefined
      return getTokenPriceInToken(baseSymbol, quoteSymbol, "1m")
    },
    enabled:
      requestBookQuery.status === "success" &&
      !requestBookQuery.data?.asks.length &&
      !requestBookQuery.data?.bids.length &&
      !!baseSymbol &&
      !!quoteSymbol,
    select: (data) => data?.close,
  })

  const [minPrice, setMinPrice] = React.useState("")
  const [maxPrice, setMaxPrice] = React.useState("")

  const geometricKandelDistribution = calculateGeometricKandelDistribution(
    minPrice,
    maxPrice,
    midPriceQuery.data?.toString() ?? "0",
    requestBookQuery.data?.bids ?? [],
    requestBookQuery.data?.asks ?? [],
  )

  return (
    <div className={cn(className)}>
      <div className="border-b">
        <div className="flex justify-between items-center px-6 pb-8">
          <AverageReturn percentage={1.5} />
          <RiskAppetite value="low" />
          <LiquiditySource />
        </div>
      </div>

      {/* CHART */}
      <div className="px-6">
        <PriceRangeChart
          bids={requestBookQuery.data?.bids}
          asks={requestBookQuery.data?.asks}
          onPriceRangeChange={([min, max]) => {
            if (!min || !max) return
            setMinPrice(min.toString())
            setMaxPrice(max.toString())
          }}
          priceRange={
            minPrice && maxPrice
              ? [Number(minPrice), Number(maxPrice)]
              : undefined
          }
          initialMidPrice={midPriceQuery.data}
          isLoading={
            requestBookQuery.status === "pending" || midPriceQuery.isLoading
          }
          geometricKandelDistribution={geometricKandelDistribution}
        />
      </div>
      <div className="mt-4 space-x-4 flex w-full justify-center items-center">
        <TokenInput
          label="Min Price"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          className="w-full"
        />
        <div>
          {" "}
          <span className="h-px w-4 bg-cloud-300"></span>{" "}
        </div>
        <TokenInput
          label="Min Price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="w-full"
        />
      </div>
    </div>
  )
})
