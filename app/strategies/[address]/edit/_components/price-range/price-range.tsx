"use client"
import Link from "next/link"
import { debounce } from "radash"
import React from "react"

import { EnhancedNumericInput } from "@/components/token-input"
import { Button } from "@/components/ui/button-old"
import withClientOnly from "@/hocs/withClientOnly"

import { PriceRangeChart } from "@/app/strategies/(shared)/_components/price-chart/price-range-chart"
import {
  calculatePriceDifferencePercentage,
  calculatePriceFromPercentage,
} from "@/utils/numbers"
import {
  ChangingFrom,
  useNewStratStore,
} from "../../../../new/_stores/new-strat.store"
import { useKandelBook } from "../../../_hooks/use-kandel-book"
import useKandel from "../../../_providers/kandel-strategy"
import EditStrategyDialog from "../edit-strategy-dialog"
import { LiquiditySource } from "./components/liquidity-source"
import { RiskAppetiteBadge } from "./components/risk-appetite"

export const PriceRange = withClientOnly(function ({
  className,
}: {
  className?: string
}) {
  const { book, isLoading } = useKandelBook()
  const midPrice = book?.midPrice
  const {
    mergedOffers,
    strategyQuery,
    strategyStatusQuery,
    baseToken,
    quoteToken,
    kandelState,
  } = useKandel()
  const onAave = strategyQuery.data?.type === "KandelAAVE"
  const priceDecimals = quoteToken?.decimals

  const [summaryDialog, setSummaryDialog] = React.useState(false)
  const [minPrice, setMinPrice] = React.useState("")
  const [minPercentage, setMinPercentage] = React.useState("")
  const [maxPrice, setMaxPrice] = React.useState("")
  const [maxPercentage, setMaxPercentage] = React.useState("")

  const {
    baseDeposit,
    quoteDeposit,
    bountyDeposit,
    stepSize,
    numberOfOffers,
    kandelParams,
    globalError,
    errors,
    isChangingFrom,
    sendFrom,
    receiveTo,
    distribution,
    setPriceRange,
    setErrors,
    setIsChangingFrom,
  } = useNewStratStore()

  const formIsInvalid =
    Object.keys(errors).length > 0 ||
    !!globalError ||
    !minPrice ||
    !maxPrice ||
    !stepSize ||
    !numberOfOffers ||
    !kandelParams

  const priceRange: [number, number] | undefined =
    minPrice && maxPrice ? [Number(minPrice), Number(maxPrice)] : undefined
  const hasLiveOffers = mergedOffers?.some((x) => x.gives > 0)

  React.useEffect(() => {
    setMinPrice(
      strategyStatusQuery.data?.minPrice.toFixed(priceDecimals) || "0",
    )
    setMaxPrice(
      strategyStatusQuery.data?.maxPrice.toFixed(priceDecimals) || "0",
    )
  }, [
    strategyQuery.data?.offers,
    strategyStatusQuery.data?.minPrice,
    strategyStatusQuery.data?.maxPrice,
  ])

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
          {/* <UnrealizedPnl pnl={currentParameter.pnlQuote} /> */}
          {/* <AverageReturn /> */}
          <RiskAppetiteBadge value={"-"} />
          <LiquiditySource />
        </div>
      </div>

      {/* CHART */}
      <div className="px-6 space-y-6">
        <PriceRangeChart
          bids={book?.bids}
          asks={book?.asks}
          onPriceRangeChange={handleOnPriceRangeChange}
          priceRange={priceRange}
          initialMidPrice={midPrice}
          isLoading={isLoading}
          geometricKandelDistribution={distribution}
          baseToken={baseToken}
          quoteToken={quoteToken}
        />

        <div className="gap-6 xl:gap-4 flex flex-col xl:flex-row w-full justify-center items-start border-b pb-6 mb-6">
          {quoteToken && (
            <div className="flex space-x-4 xl:flex-1 w-full">
              <EnhancedNumericInput
                label="Min Price"
                value={minPrice}
                onChange={handleMinPriceChange}
                token={quoteToken}
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
          {quoteToken && (
            <div className="flex space-x-4 xl:flex-1 w-full">
              <EnhancedNumericInput
                label="Max Price"
                value={maxPrice}
                onChange={handleMaxPriceChange}
                token={quoteToken}
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

        {globalError && (
          <p
            role="aria-live"
            className="text-red-100 text-md leading-4 mt-1 mb-2 w-full text-center"
          >
            {globalError}
          </p>
        )}

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
            disabled={formIsInvalid}
            onClick={() => setSummaryDialog(!summaryDialog)}
          >
            Summary
          </Button>
        </div>
        <EditStrategyDialog
          strategy={{
            riskAppetite: "-",
            kandelParams,
            baseDeposit,
            quoteDeposit,
            priceRange,
            numberOfOffers,
            stepSize,
            bountyDeposit,
            hasLiveOffers,
            sendFrom,
            receiveTo,
            onAave,
          }}
          isOpen={summaryDialog}
          onClose={() => setSummaryDialog(false)}
        />
      </div>
    </div>
  )
})
