"use client"
import React from "react"
import { useAccount, useBalance } from "wagmi"

import { TokenBalance } from "@/components/stateful/token-balance/token-balance"
import { EnhancedNumericInput } from "@/components/token-input"
import { Skeleton } from "@/components/ui/skeleton"
import useMarket from "@/providers/market"
import { cn } from "@/utils"
import { useDebounce } from "usehooks-ts"
import { usePriceRangeStore } from "../../_stores/price-range.store"
import { Fieldset } from "../fieldset"
import { MinimumRecommended } from "./components/minimum-recommended"
import { MustBeBetweenInfo } from "./components/must-be-between-info"
import { useKandelRequirements } from "./hooks/use-kandel-requirements"

export function Form({ className }: { className?: string }) {
  const { address } = useAccount()
  const { data: nativeBalance } = useBalance({
    address,
  })
  const { market } = useMarket()
  const baseToken = market?.base
  const quoteToken = market?.quote

  const [baseDeposit, setBaseDeposit] = React.useState("")
  const [quoteDeposit, setQuoteDeposit] = React.useState("")
  const [pricePoints, setPricePoints] = React.useState("2")
  const [ratio, setRatio] = React.useState("1.5")
  const [stepSize, setStepSize] = React.useState("1")
  const [bounty, setBounty] = React.useState("")

  const debouncedBaseDeposit = useDebounce(baseDeposit, 300)
  const debouncedQuoteDeposit = useDebounce(quoteDeposit, 300)
  const debouncedStepSize = useDebounce(stepSize, 300)
  const debouncedPricePoints = useDebounce(pricePoints, 300)

  const [minPrice, maxPrice] = usePriceRangeStore((store) => store.priceRange)
  const fieldsDisabled = !(minPrice && maxPrice)

  const kandelRequirementsQuery = useKandelRequirements({
    onAave: false,
    minPrice,
    maxPrice,
    baseDeposit: debouncedBaseDeposit,
    quoteDeposit: debouncedQuoteDeposit,
    stepSize: debouncedStepSize,
    pricePoints: debouncedPricePoints,
  })

  const { requiredBase, requiredQuote, requiredBounty } =
    kandelRequirementsQuery.data || {}

  const handleBaseDepositChange = (
    e: React.ChangeEvent<HTMLInputElement> | string,
  ) => {
    const value = typeof e === "string" ? e : e.target.value
    setBaseDeposit(value)
  }

  const handleQuoteDepositChange = (
    e: React.ChangeEvent<HTMLInputElement> | string,
  ) => {
    const value = typeof e === "string" ? e : e.target.value
    setQuoteDeposit(value)
  }

  const handlePricePointsChange = (
    e: React.ChangeEvent<HTMLInputElement> | string,
  ) => {
    const value = typeof e === "string" ? e : e.target.value
    setPricePoints(value)
  }

  const handleRatioChange = (
    e: React.ChangeEvent<HTMLInputElement> | string,
  ) => {
    const value = typeof e === "string" ? e : e.target.value
    setRatio(value)
  }

  const handleStepSizeChange = (
    e: React.ChangeEvent<HTMLInputElement> | string,
  ) => {
    const value = typeof e === "string" ? e : e.target.value
    setStepSize(value)
  }

  const handleBountyDepositChange = (
    e: React.ChangeEvent<HTMLInputElement> | string,
  ) => {
    const value = typeof e === "string" ? e : e.target.value
    setBounty(value)
  }

  if (!baseToken || !quoteToken)
    return (
      <div className={"p-0.5"}>
        <Skeleton className="w-full h-screen" />
      </div>
    )

  return (
    <form
      className={cn("space-y-6", className)}
      onSubmit={(e) => {
        e.preventDefault()
      }}
    >
      <Fieldset className="space-y-4" legend="Set initial inventory">
        <div>
          <EnhancedNumericInput
            token={baseToken}
            label={`${baseToken?.symbol} deposit`}
            value={baseDeposit}
            onChange={handleBaseDepositChange}
            disabled={fieldsDisabled}
          />
          <MinimumRecommended
            token={baseToken}
            value={requiredBase?.toFixed(baseToken.decimals)}
            action={{
              onClick: () =>
                requiredBase &&
                handleBaseDepositChange(requiredBase.toString()),
              text: "Update",
            }}
            loading={
              kandelRequirementsQuery.status !== "success" || fieldsDisabled
            }
          />
          <TokenBalance
            label="Wallet balance"
            token={baseToken}
            action={{
              onClick: handleBaseDepositChange,
              text: "MAX",
            }}
          />
        </div>
        <div>
          <EnhancedNumericInput
            token={quoteToken}
            label={`${quoteToken?.symbol} deposit`}
            value={quoteDeposit}
            onChange={handleQuoteDepositChange}
            disabled={fieldsDisabled}
          />

          <MinimumRecommended
            token={quoteToken}
            value={requiredQuote?.toFixed(quoteToken.decimals)}
            action={{
              onClick: () =>
                requiredQuote &&
                handleQuoteDepositChange(requiredQuote.toString()),
              text: "Update",
            }}
            loading={
              kandelRequirementsQuery.status !== "success" || fieldsDisabled
            }
          />
          <TokenBalance
            label="Wallet balance"
            token={quoteToken}
            action={{
              onClick: handleQuoteDepositChange,
              text: "MAX",
            }}
          />
        </div>
      </Fieldset>

      <Fieldset legend="Settings">
        <div>
          <EnhancedNumericInput
            label="Number of price points"
            value={pricePoints}
            onChange={handlePricePointsChange}
            disabled={fieldsDisabled}
          />
          <MustBeBetweenInfo
            min={2}
            max={255}
            onMinClicked={handlePricePointsChange}
          />
        </div>

        <div>
          <EnhancedNumericInput
            label="Ratio"
            value={ratio}
            onChange={handleRatioChange}
            disabled={fieldsDisabled}
          />
          <MustBeBetweenInfo
            min={1.00001}
            max={2}
            onMinClicked={handleRatioChange}
          />
        </div>
        <div>
          <EnhancedNumericInput
            label="Step size"
            value={stepSize}
            onChange={handleStepSizeChange}
            disabled={fieldsDisabled}
          />
          <MustBeBetweenInfo
            min={1}
            max={8}
            onMinClicked={handleStepSizeChange}
          />
        </div>
      </Fieldset>

      <Fieldset legend="Bounty">
        <div>
          <EnhancedNumericInput
            label={`${nativeBalance?.symbol} deposit`}
            token={nativeBalance?.symbol}
            value={bounty}
            onChange={handleBountyDepositChange}
            disabled={fieldsDisabled}
          />
          <MinimumRecommended
            token={nativeBalance?.symbol}
            value={requiredBounty}
            action={{
              onClick: handleBountyDepositChange,
              text: "Update",
            }}
            loading={
              kandelRequirementsQuery.status !== "success" || fieldsDisabled
            }
          />

          <TokenBalance
            label="Wallet balance"
            token={nativeBalance?.symbol}
            action={{
              onClick: handleBountyDepositChange,
              text: "MAX",
            }}
          />
        </div>
      </Fieldset>
    </form>
  )
}
