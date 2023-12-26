"use client"
import { useQuery } from "@tanstack/react-query"
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
