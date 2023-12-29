"use client"
import React from "react"
import { useAccount, useBalance } from "wagmi"

import { TokenBalance } from "@/components/stateful/token-balance/token-balance"
import { EnhancedNumericInput } from "@/components/token-input"
import { Skeleton } from "@/components/ui/skeleton"
import { useTokenBalance } from "@/hooks/use-token-balance"
import useMarket from "@/providers/market"
import { cn } from "@/utils"
import { useDebounce } from "usehooks-ts"
import { usePriceRangeStore } from "../../_stores/price-range.store"
import { Fieldset } from "../fieldset"
import { MinimumRecommended } from "./components/minimum-recommended"
import { MustBeBetweenInfo } from "./components/must-be-between-info"
import { useKandelRequirements } from "./hooks/use-kandel-requirements"

type ChangingFrom =
  | "baseDeposit"
  | "quoteDeposit"
  | "pricePoints"
  | "ratio"
  | "stepSize"
  | "bountyDeposit"
  | undefined
  | null

const [MIN_PRICE_POINTS, MAX_PRICE_POINTS] = [2, 255]
const [MIN_RATIO, MAX_RATIO] = [1.00001, 2]
const [MIN_STEP_SIZE, MAX_STEP_SIZE] = [1, 8]

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
  const [pricePoints, setPricePoints] = React.useState("2")
  const [ratio, setRatio] = React.useState("1.5")
  const [stepSize, setStepSize] = React.useState("1")
  const [bountyDeposit, setBountyDeposit] = React.useState("")

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

    if (
      Number(pricePoints) > Number(MAX_PRICE_POINTS) ||
      (Number(pricePoints) < Number(MIN_PRICE_POINTS) && pricePoints)
    ) {
      newErrors.pricePoints =
        "Price points must be between 2 and 255 (inclusive)"
    } else {
      delete newErrors.pricePoints
    }

    if (
      Number(ratio) > Number(MAX_RATIO) ||
      (Number(ratio) < Number(MIN_RATIO) && ratio)
    ) {
      newErrors.ratio = "Ratio must be between 1.00001 and 2 (inclusive)"
    } else {
      delete newErrors.ratio
    }

    if (
      Number(stepSize) > Number(MAX_STEP_SIZE) ||
      (Number(stepSize) < Number(MIN_STEP_SIZE) && stepSize)
    ) {
      newErrors.stepSize = "Step size must be between 1 and 8 (inclusive)"
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
          <MustBeBetweenInfo
            min={MIN_PRICE_POINTS}
            max={MAX_PRICE_POINTS}
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
          <MustBeBetweenInfo
            min={MIN_RATIO}
            max={MAX_RATIO}
            onMinClicked={handleRatioChange}
          />
        </div>
        <div>
          <EnhancedNumericInput
            label="Step size"
            value={stepSize}
            onChange={handleStepSizeChange}
            disabled={fieldsDisabled}
            error={isChangingFrom === "stepSize" ? errors.stepSize : undefined}
          />
          <MustBeBetweenInfo
            min={MIN_STEP_SIZE}
            max={MAX_STEP_SIZE}
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
