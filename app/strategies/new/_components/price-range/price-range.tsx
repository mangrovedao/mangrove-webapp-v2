"use client"
import Big from "big.js"
import React from "react"

import { TokenInput } from "@/components/token-input"
import withClientOnly from "@/hocs/withClientOnly"
import useMarket from "@/providers/market"
import { cn } from "@/utils"
import { calculatePriceDifferencePercentage } from "@/utils/numbers"
import { AverageReturn } from "./components/average-return"
import { LiquiditySource } from "./components/liquidity-source"
import { PriceRangeChart } from "./components/price-chart/price-range-chart"
import { RiskAppetite } from "./components/risk-appetite"

const calculateGeometricKandelDistribution = (
  minPrice: string,
  maxPrice: string,
  midPrice?: number | null,
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
  const numOffers = 5
  const priceStep = (maxPriceNumber - minPriceNumber) / (numOffers - 1)
  const bids: {
    price: Big
    index: number
    gives: Big
    tick: number
  }[] = []
  const asks: {
    price: Big
    index: number
    gives: Big
    tick: number
  }[] = []

  if (!midPrice) return { bids: [], asks: [] }

  if (!midPrice && bids.length > 0 && asks.length > 0) {
    const highestBid = Math.max(...bids.map((bid) => Number(bid.price)))
    const lowestAsk = Math.min(...asks.map((ask) => Number(ask.price)))
    midPrice = (highestBid + lowestAsk) / 2
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

    if (price.lt(midPrice)) {
      bids.push(offer)
    } else {
      asks.push(offer)
    }
  }

  return {
    bids: bids,
    asks: asks,
  }
}

export const PriceRange = withClientOnly(function ({
  className,
}: {
  className?: string
}) {
  const { requestBookQuery, midPrice, market } = useMarket()
  const priceDecimals = market?.quote.decimals

  const [minPrice, setMinPrice] = React.useState("")
  const [minPercentage, setMinPercentage] = React.useState("")
  const [maxPrice, setMaxPrice] = React.useState("")

  const geometricKandelDistribution = calculateGeometricKandelDistribution(
    minPrice,
    maxPrice,
    midPrice,
  )

  const priceRange: [number, number] | undefined =
    minPrice && maxPrice ? [Number(minPrice), Number(maxPrice)] : undefined

  React.useEffect(() => {
    if (minPrice && midPrice) {
      const minPriceNumber = Number(minPrice)
      const midPriceNumber = Number(midPrice)
      const percentageDifference = calculatePriceDifferencePercentage({
        price: midPriceNumber,
        value: minPriceNumber,
      })
      setMinPercentage(percentageDifference.toFixed(2)) // Keep 2 decimal places
    }
  }, [minPrice, midPrice])

  const handleOnPriceRangeChange = ([min, max]: number[]) => {
    if (!min || !max) return
    setMinPrice(min.toFixed(priceDecimals))
    setMaxPrice(max.toFixed(priceDecimals))
  }

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
      <div className="px-6 space-y-6">
        <PriceRangeChart
          bids={requestBookQuery.data?.bids}
          asks={requestBookQuery.data?.asks}
          onPriceRangeChange={handleOnPriceRangeChange}
          priceRange={priceRange}
          initialMidPrice={midPrice}
          isLoading={requestBookQuery.status === "pending"}
          geometricKandelDistribution={geometricKandelDistribution}
        />

        <div className="gap-4 flex flex-col xl:flex-row w-full justify-center items-center">
          {market?.quote && (
            <div className="flex space-x-4 xl:flex-1 w-full">
              <TokenInput
                label="Min Price"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                token={market.quote}
                className="w-full"
              />

              <TokenInput label="Min %" value={minPercentage} />
            </div>
          )}
          <span className="h-px w-4 bg-cloud-300 mt-4"></span>
          {market?.quote && (
            <div className="flex space-x-4 xl:flex-1 w-full">
              <TokenInput
                label="Max Price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                token={market.quote}
                className="w-full"
              />
              <TokenInput label="Max %" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
})
