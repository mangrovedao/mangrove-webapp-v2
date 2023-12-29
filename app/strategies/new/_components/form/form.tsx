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
import { InitialInventoryInfo } from "./components/initial-inventory-info"
import { useKandelRequirements } from "./hooks/use-kandel-requirements"

export function Form({ className }: { className?: string }) {
  const { address } = useAccount()
  const { data: nativeBalance } = useBalance({
    address,
  })
  const { market } = useMarket()
  const baseToken = market?.base
  const quoteToken = market?.quote
  const walletBalanceLabel = "Wallet balance"

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
  const fieldsDisabled = !minPrice || !maxPrice

  const kandelRequirementsQuery = useKandelRequirements({
    onAave: false,
    minPrice,
    maxPrice,
    baseDeposit: debouncedBaseDeposit,
    quoteDeposit: debouncedQuoteDeposit,
    stepSize: debouncedStepSize,
    pricePoints: debouncedPricePoints,
  })

  const handleBaseDepositChange = (
    e: React.ChangeEvent<HTMLInputElement> | string,
  ) => {
    if (typeof e === "string") {
      setBaseDeposit(e)
      return
    }
    setBaseDeposit(e.target.value)
  }

  const handleQuoteDepositChange = (
    e: React.ChangeEvent<HTMLInputElement> | string,
  ) => {
    if (typeof e === "string") {
      setQuoteDeposit(e)
      return
    }
    setQuoteDeposit(e.target.value)
  }

  const handlePricePointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPricePoints(e.target.value)
  }

  const handleRatioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRatio(e.target.value)
  }

  const handleStepSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStepSize(e.target.value)
  }

  const handleBountyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBounty(e.target.value)
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
          <InitialInventoryInfo
            token={baseToken}
            value={0.119}
            action={{
              onClick: () => {},
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

          <InitialInventoryInfo
            token={quoteToken}
            value={0.119}
            action={{
              onClick: () => {},
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
        <EnhancedNumericInput
          label="Number of price points"
          value={pricePoints}
          onChange={handlePricePointsChange}
          disabled={fieldsDisabled}
        />
        <EnhancedNumericInput
          label="Ratio"
          value={ratio}
          onChange={handleRatioChange}
          disabled={fieldsDisabled}
        />
        <EnhancedNumericInput
          label="Step size"
          value={stepSize}
          onChange={handleStepSizeChange}
          disabled={fieldsDisabled}
        />
      </Fieldset>

      <Fieldset legend="Bounty">
        <EnhancedNumericInput
          label={`${nativeBalance?.symbol} deposit`}
          token={nativeBalance?.symbol}
          showBalance
          balanceLabel={walletBalanceLabel}
          value={bounty}
          onChange={handleBountyChange}
          disabled={fieldsDisabled}
        />
      </Fieldset>
    </form>
  )
}
