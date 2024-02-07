/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"
import Big from "big.js"
import Link from "next/link"
import { debounce } from "radash"
import React from "react"

import { EnhancedNumericInput } from "@/components/token-input"
import { Button } from "@/components/ui/button"
import withClientOnly from "@/hocs/withClientOnly"
import useMarket from "@/providers/market"
import {
  calculatePriceDifferencePercentage,
  calculatePriceFromPercentage,
} from "@/utils/numbers"
import { useNewStratStore } from "../../_stores/new-strat.store"
import { AverageReturn } from "./components/average-return"
import { LiquiditySource } from "./components/liquidity-source"
import { PriceRangeChart } from "./components/price-chart/price-range-chart"
import { RiskAppetiteBadge } from "./components/risk-appetite"

type ChangingFrom =
  | "minPrice"
  | "maxPrice"
  | "minPercentage"
  | "maxPercentage"
  | "chart"
  | undefined
  | null

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
  const { requestBookQuery, midPrice, market, riskAppetite } = useMarket()
  const priceDecimals = market?.quote.decimals

  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [touchedFields, setTouchedFields] = React.useState<
    Record<string, boolean>
  >({})
  const [isChangingFrom, setIsChangingFrom] = React.useState<ChangingFrom>()
  const [minPrice, setMinPrice] = React.useState("")
  const [minPercentage, setMinPercentage] = React.useState("")
  const [maxPrice, setMaxPrice] = React.useState("")
  const [maxPercentage, setMaxPercentage] = React.useState("")

  const setPriceRange = useNewStratStore((store) => store.setPriceRange)

  const geometricKandelDistribution = calculateGeometricKandelDistribution(
    minPrice,
    maxPrice,
    midPrice,
  )

  const priceRange: [number, number] | undefined =
    minPrice && maxPrice ? [Number(minPrice), Number(maxPrice)] : undefined

  React.useEffect(() => {
    if (isChangingFrom !== "minPercentage" && minPrice && midPrice) {
      const minPriceNumber = Number(minPrice)
      const midPriceNumber = Number(midPrice)
      const percentageDifference = calculatePriceDifferencePercentage({
        price: midPriceNumber,
        value: minPriceNumber,
      })
      setMinPercentage(percentageDifference.toFixed(2)) // Keep 2 decimal places
    }
  }, [minPrice, midPrice, isChangingFrom])

  React.useEffect(() => {
    if (isChangingFrom !== "maxPercentage" && maxPrice && midPrice) {
      const maxPriceNumber = Number(maxPrice)
      const midPriceNumber = Number(midPrice)
      const percentageDifference = calculatePriceDifferencePercentage({
        price: midPriceNumber,
        value: maxPriceNumber,
      })
      setMaxPercentage(percentageDifference.toFixed(2)) // Keep 2 decimal places
    }
  }, [isChangingFrom, maxPrice, midPrice])

  const handleFieldChange = (field: ChangingFrom) => {
    setIsChangingFrom(field)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    setTouchedFields((prevFields) => ({ ...prevFields, [field]: true }))
  }

  const handleOnPriceRangeChange = ([min, max]: number[]) => {
    if (!min || !max) return
    handleFieldChange("chart")
    setMinPrice(min.toFixed(priceDecimals))
    setMaxPrice(max.toFixed(priceDecimals))
  }

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFieldChange("minPrice")
    const price = e.target.value
    setMinPrice(price)
  }

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFieldChange("maxPrice")
    const price = e.target.value
    setMaxPrice(price)
  }

  const handleMinPercentageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const percentage = e.target.value
    if (percentage === "-" || !isFinite(Number(percentage))) {
      return
    }

    handleFieldChange("minPercentage")

    if (midPrice) {
      const percentage = Number(e.target.value)
      const newMinPrice = calculatePriceFromPercentage({
        percentage,
        basePrice: midPrice,
      })
      setMinPrice(newMinPrice.toFixed(priceDecimals))
    }
  }

  const handleMaxPercentageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const percentage = e.target.value
    if (percentage === "-" || !isFinite(Number(percentage))) {
      return
    }

    handleFieldChange("maxPercentage")

    if (midPrice) {
      const percentage = Number(e.target.value)
      const newMaxPrice = calculatePriceFromPercentage({
        percentage,
        basePrice: midPrice,
      })
      setMaxPrice(newMaxPrice.toFixed(priceDecimals))
    }
  }

  React.useEffect(() => {
    const newErrors = { ...errors }

    if (Number(minPrice) > Number(maxPrice) && maxPrice) {
      newErrors.minPrice = "Min price cannot be greater than max price"
    } else {
      delete newErrors.minPrice
    }

    if (Number(maxPrice) < Number(minPrice) && minPrice) {
      newErrors.maxPrice = "Max price cannot be less than min price"
    } else {
      delete newErrors.maxPrice
    }

    if (Number(minPercentage) > Number(maxPercentage) && maxPercentage) {
      newErrors.minPercentage =
        "Min percentage cannot be greater than max percentage"
    } else {
      delete newErrors.minPercentage
    }

    if (Number(maxPercentage) < Number(minPercentage) && minPercentage) {
      newErrors.maxPercentage =
        "Max percentage cannot be less than min percentage"
    } else {
      delete newErrors.maxPercentage
    }

    setErrors(newErrors)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minPrice, maxPrice, minPercentage, maxPercentage])

  const debouncedSetPriceRange = React.useCallback(
    debounce(
      {
        delay: 300,
      },
      (min: string, max: string) => setPriceRange(min, max),
    ),
    [],
  )

  React.useEffect(() => {
    if (!minPrice || !maxPrice) return
    debouncedSetPriceRange(minPrice, maxPrice)
  }, [minPrice, maxPrice])

  return (
    <div className={className}>
      <div className="border-b">
        <div className="flex justify-between items-center px-6 pb-8">
          <AverageReturn percentage={1.5} />
          <RiskAppetiteBadge
            value={riskAppetite}
          />
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

        <div className="gap-6 xl:gap-4 flex flex-col xl:flex-row w-full justify-center items-start border-b pb-6 mb-6">
          {market?.quote && (
            <div className="flex space-x-4 xl:flex-1 w-full">
              <EnhancedNumericInput
                label="Min Price"
                value={minPrice}
                onChange={handleMinPriceChange}
                token={market.quote}
                className="w-full"
                error={
                  isChangingFrom === "minPrice" ? errors.minPrice : undefined
                }
              />

              <EnhancedNumericInput
                label="Min %"
                value={minPercentage}
                onChange={handleMinPercentageChange}
                allowNegative
                error={
                  isChangingFrom === "minPercentage"
                    ? errors.minPrice
                    : undefined
                }
              />
            </div>
          )}
          <div className="h-20 w-4 xl:flex items-center hidden">
            <span className="h-px w-4 bg-cloud-400"></span>
          </div>
          {market?.quote && (
            <div className="flex space-x-4 xl:flex-1 w-full">
              <EnhancedNumericInput
                label="Max Price"
                value={maxPrice}
                onChange={handleMaxPriceChange}
                token={market.quote}
                className="w-full"
                error={
                  isChangingFrom === "maxPrice" ? errors.minPrice : undefined
                }
              />
              <EnhancedNumericInput
                label="Max %"
                value={maxPercentage}
                onChange={handleMaxPercentageChange}
                allowNegative
                error={
                  isChangingFrom === "maxPercentage"
                    ? errors.minPrice
                    : undefined
                }
              />
            </div>
          )}
        </div>

        <div className="flex justify-between">
          <Button
            asChild
            variant={"secondary"}
            size={"lg"}
            className="w-full text-center max-w-32"
          >
            <Link href="/strategies">Back</Link>
          </Button>
          <Button
            size={"lg"}
            rightIcon
            className="w-full max-w-72 text-center"
            disabled
          >
            Summary
          </Button>
        </div>
      </div>
    </div>
  )
})
