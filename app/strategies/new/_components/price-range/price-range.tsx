"use client"
import React from "react"

import { TokenInput } from "@/components/token-input"
import withClientOnly from "@/hocs/withClientOnly"
import useMarket from "@/providers/market"
import { cn } from "@/utils"
import { AverageReturn } from "./components/average-return"
import { LiquiditySource } from "./components/liquidity-source"
import { PriceRangeChart } from "./components/price-chart/price-range-chart"
import { RiskAppetite } from "./components/risk-appetite"

export const PriceRange = withClientOnly(function ({
  className,
}: {
  className?: string
}) {
  const [minPrice, setMinPrice] = React.useState("")
  const [maxPrice, setMaxPrice] = React.useState("")
  const { requestBookQuery } = useMarket()
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
          initialPriceRange={
            minPrice && maxPrice
              ? [Number(minPrice), Number(maxPrice)]
              : undefined
          }
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
