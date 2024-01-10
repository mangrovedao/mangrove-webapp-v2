"use client"
import React from "react"
import { useAccount, useBalance } from "wagmi"

import { TokenBalance } from "@/components/stateful/token-balance/token-balance"
import { EnhancedNumericInput } from "@/components/token-input"
import { Skeleton } from "@/components/ui/skeleton"
import { useTokenBalance } from "@/hooks/use-token-balance"
import useMarket from "@/providers/market"
import { cn } from "@/utils"
import { getErrorMessage } from "@/utils/errors"
import { useDebounce } from "usehooks-ts"
import { useNewStratStore } from "../../_stores/new-strat.store"
import { Fieldset } from "../fieldset"
import { MinimumRecommended } from "./components/minimum-recommended"
import { MustBeAtLeastInfo } from "./components/must-be-at-least-info"
import { useKandelRequirements } from "./hooks/use-kandel-requirements"

export type ChangingFrom =
  | "baseDeposit"
  | "quoteDeposit"
  | "pricePoints"
  | "ratio"
  | "stepSize"
  | "bountyDeposit"
  | undefined
  | null

const MIN_PRICE_POINTS = 2
const MIN_RATIO = 1.001
const MIN_STEP_SIZE = 1

export function Form({ className }: { className?: string }) {
  const { address } = useAccount()

  const { market } = useMarket()
  const baseToken = market?.base
  const quoteToken = market?.quote
  const baseBalance = useTokenBalance(baseToken)
  const quoteBalance = useTokenBalance(quoteToken)
  const { data: nativeBalance } = useBalance({
    address,
  })

  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [touchedFields, setTouchedFields] = React.useState<
    Record<string, boolean>
  >({})
  const [isChangingFrom, setIsChangingFrom] = React.useState<ChangingFrom>()

  const [baseDeposit, setBaseDeposit] = React.useState("")
  const [quoteDeposit, setQuoteDeposit] = React.useState("")
  const [pricePoints, setPricePoints] = React.useState("10")
  const [ratio, setRatio] = React.useState("")
  const [stepSize, setStepSize] = React.useState("1")
  const [bountyDeposit, setBountyDeposit] = React.useState("")

  const debouncedBaseDeposit = useDebounce(baseDeposit, 300)
  const debouncedQuoteDeposit = useDebounce(quoteDeposit, 300)
  const debouncedStepSize = useDebounce(stepSize, 300)
  const debouncedPricePoints = useDebounce(pricePoints, 300)

  const [minPrice, maxPrice] = useNewStratStore((store) => store.priceRange)
  const setGlobalError = useNewStratStore((store) => store.setError)
  const fieldsDisabled = !(minPrice && maxPrice)

  const kandelRequirementsQuery = useKandelRequirements({
    onAave: false,
    minPrice,
    maxPrice,
    baseDeposit: debouncedBaseDeposit,
    quoteDeposit: debouncedQuoteDeposit,
    stepSize: debouncedStepSize,
    pricePoints: debouncedPricePoints,
    ratio,
    isChangingFrom,
  })

  const {
    requiredBase,
    requiredQuote,
    requiredBounty,
    offersWithPrices,
    priceRatio,
    pricePoints: points,
  } = kandelRequirementsQuery.data || {}

  const setOffersWithPrices = useNewStratStore(
    (store) => store.setOffersWithPrices,
  )

  // if kandelRequirementsQuery has error
  React.useEffect(() => {
    if (kandelRequirementsQuery.error) {
      setGlobalError(getErrorMessage(kandelRequirementsQuery.error))
      return
    }
    setGlobalError(undefined)
  }, [kandelRequirementsQuery.error])

  // Update ratio field if number of price points is changing
  React.useEffect(() => {
    if (isChangingFrom === "ratio" || !priceRatio) return
    setRatio(priceRatio.toFixed(4))
  }, [priceRatio])

  React.useEffect(() => {
    if (
      isChangingFrom === "pricePoints" ||
      !points ||
      Number(pricePoints) === points
    )
      return
    setPricePoints(points.toString())
  }, [points])

  React.useEffect(() => {
    setOffersWithPrices(offersWithPrices)
  }, [offersWithPrices])

  const handleFieldChange = (field: ChangingFrom) => {
    setIsChangingFrom(field)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    setTouchedFields((prevFields) => ({ ...prevFields, [field]: true }))
  }

  const handleBaseDepositChange = (
    e: React.ChangeEvent<HTMLInputElement> | string,
  ) => {
    handleFieldChange("baseDeposit")
    const value = typeof e === "string" ? e : e.target.value
    setBaseDeposit(value)
  }

  const handleQuoteDepositChange = (
    e: React.ChangeEvent<HTMLInputElement> | string,
  ) => {
    handleFieldChange("quoteDeposit")
    const value = typeof e === "string" ? e : e.target.value
    setQuoteDeposit(value)
  }

  const handlePricePointsChange = (
    e: React.ChangeEvent<HTMLInputElement> | string,
  ) => {
    handleFieldChange("pricePoints")
    const value = typeof e === "string" ? e : e.target.value
    setPricePoints(value)
  }

  const handleRatioChange = (
    e: React.ChangeEvent<HTMLInputElement> | string,
  ) => {
    handleFieldChange("ratio")
    const value = typeof e === "string" ? e : e.target.value
    setRatio(value)
  }

  const handleStepSizeChange = (
    e: React.ChangeEvent<HTMLInputElement> | string,
  ) => {
    handleFieldChange("stepSize")
    const value = typeof e === "string" ? e : e.target.value
    setStepSize(value)
  }

  const handleBountyDepositChange = (
    e: React.ChangeEvent<HTMLInputElement> | string,
  ) => {
    handleFieldChange("bountyDeposit")
    const value = typeof e === "string" ? e : e.target.value
    setBountyDeposit(value)
  }

  React.useEffect(() => {
    const newErrors = { ...errors }

    if (Number(baseDeposit) > Number(baseBalance.formatted) && baseDeposit) {
      newErrors.baseDeposit =
        "Base deposit cannot be greater than wallet balance"
    } else {
      delete newErrors.baseDeposit
    }

    if (Number(quoteDeposit) > Number(quoteBalance.formatted) && quoteDeposit) {
      newErrors.quoteDeposit =
        "Quote deposit cannot be greater than wallet balance"
    } else {
      delete newErrors.quoteDeposit
    }

    if (Number(pricePoints) < Number(MIN_PRICE_POINTS) && pricePoints) {
      newErrors.pricePoints = "Price points must be at least 2"
    } else {
      delete newErrors.pricePoints
    }

    if (Number(ratio) < Number(MIN_RATIO) && ratio) {
      newErrors.ratio = "Ratio must be at least 1.001"
    } else {
      delete newErrors.ratio
    }

    debugger
    if (
      (Number(stepSize) < Number(MIN_STEP_SIZE) ||
        Number(stepSize) >= Number(pricePoints)) &&
      stepSize
    ) {
      newErrors.stepSize =
        "Step size must be at least 1 and inferior to price points"
    } else {
      delete newErrors.stepSize
    }

    if (
      Number(bountyDeposit) > Number(nativeBalance?.formatted) &&
      bountyDeposit
    ) {
      newErrors.bountyDeposit =
        "Bounty deposit cannot be greater than wallet balance"
    } else {
      delete newErrors.bountyDeposit
    }

    setErrors(newErrors)
  }, [baseDeposit, quoteDeposit, pricePoints, ratio, stepSize, bountyDeposit])

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
            error={
              isChangingFrom === "baseDeposit" ? errors.baseDeposit : undefined
            }
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
            error={
              isChangingFrom === "quoteDeposit"
                ? errors.quoteDeposit
                : undefined
            }
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
            error={
              isChangingFrom === "pricePoints" ? errors.pricePoints : undefined
            }
          />
          <MustBeAtLeastInfo
            min={MIN_PRICE_POINTS}
            onMinClicked={handlePricePointsChange}
          />
        </div>

        <div>
          <EnhancedNumericInput
            label="Ratio"
            value={ratio}
            onChange={handleRatioChange}
            disabled={fieldsDisabled}
            error={isChangingFrom === "ratio" ? errors.ratio : undefined}
          />
          <MustBeAtLeastInfo min={MIN_RATIO} onMinClicked={handleRatioChange} />
        </div>
        <div>
          <EnhancedNumericInput
            label="Step size"
            value={stepSize}
            onChange={handleStepSizeChange}
            disabled={fieldsDisabled}
            error={isChangingFrom === "stepSize" ? errors.stepSize : undefined}
          />
          <MustBeAtLeastInfo
            min={MIN_STEP_SIZE}
            onMinClicked={handleStepSizeChange}
          />
        </div>
      </Fieldset>

      <Fieldset legend="Bounty">
        <div>
          <EnhancedNumericInput
            label={`${nativeBalance?.symbol} deposit`}
            token={nativeBalance?.symbol}
            value={bountyDeposit}
            onChange={handleBountyDepositChange}
            disabled={fieldsDisabled}
            error={
              isChangingFrom === "bountyDeposit"
                ? errors.bountyDeposit
                : undefined
            }
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
