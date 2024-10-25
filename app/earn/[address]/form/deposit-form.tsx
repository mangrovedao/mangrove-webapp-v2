"use client"

import React from "react"
import { formatUnits } from "viem"

import { EnhancedNumericInput } from "@/components/token-input-new"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/utils"
import DepositToVaultDialog from "./dialogs/deposit-dialog"
import useForm from "./use-form"

const sliderValues = [25, 50, 75]

export function DepositForm({ className }: { className?: string }) {
  const [addDialog, setAddDialog] = React.useState(false)

  const [baseSliderValue, setBaseSliderValue] = React.useState(0)
  const [quoteSliderValue, setQuoteSliderValue] = React.useState(0)

  const {
    baseToken,
    quoteToken,
    baseDeposit,
    quoteDeposit,
    baseBalance,
    quoteBalance,
    mintAmount,
    errors,
    handleBaseDepositChange,
    handleQuoteDepositChange,
    isLoading,
    vault,
  } = useForm()

  const handleBaseSliderChange = (value: number) => {
    if (!baseBalance) return
    const amount = (BigInt(value * 100) * baseBalance.balance) / 10_000n

    setBaseSliderValue(value)
    setQuoteSliderValue(0)
    handleBaseDepositChange(formatUnits(amount, baseBalance.token.decimals))
  }

  const handleQuoteSliderChange = (value: number) => {
    if (!quoteBalance) return
    const amount = (BigInt(value * 100) * quoteBalance.balance) / 10_000n

    setQuoteSliderValue(value)
    setBaseSliderValue(0)
    handleQuoteDepositChange(formatUnits(amount, quoteBalance.token.decimals))
  }

  React.useEffect(() => {
    handleBaseSliderChange(25)
    handleQuoteSliderChange(25)
  }, [baseBalance, quoteBalance])

  if (!baseToken || !quoteToken)
    return (
      <div className={"p-0.5"}>
        <Skeleton className="w-full h-40" />
      </div>
    )

  return (
    <form
      className={cn("space-y-6", className)}
      onSubmit={(e) => {
        e.preventDefault()
      }}
    >
      <div className="grid -gap-4 bg-bg-primary rounded-lg p-2 focus-within:border focus-within:border-border-brand">
        <EnhancedNumericInput
          token={baseToken}
          label={`Deposit ${baseSliderValue}%`}
          inputClassName="bg-bg-primary"
          value={Number(baseDeposit).toFixed(baseToken.displayDecimals)}
          onChange={handleBaseDepositChange}
          error={errors.baseDeposit}
          showBalance
          balanceAction={{ onClick: handleBaseDepositChange, text: "MAX" }}
        />
        <div className="grid -mt-1">
          <div className="flex items-center gap-1 ">
            <i className="text-text-quaternary">≈</i>
            <span className="text-xs text-text-secondary">...</span>
            <span className="text-xs text-text-quaternary">$</span>
          </div>

          <div className="space-y-5 px-3">
            <div className="flex justify-center space-x-2">
              {sliderValues.map((value, i) => (
                <Button
                  key={`percentage-button-${value}`}
                  variant={"secondary"}
                  size={"md"}
                  value={baseSliderValue}
                  className={cn(
                    "!h-6 text-xs w-full !rounded-md flex items-center justify-center border-none",
                    {
                      "bg-bg-tertiary": baseSliderValue === value,
                    },
                  )}
                  onClick={(e) => {
                    e.preventDefault()
                    handleBaseSliderChange(Number(value))
                  }}
                >
                  {value}%
                </Button>
              ))}
              <Button
                key={`percentage-button-max`}
                variant={"secondary"}
                size={"xs"}
                className={cn(
                  "!h-6 text-xs w-full !rounded-md flex items-center justify-center border-none",
                )}
                onClick={(e) => {
                  handleBaseSliderChange(100)
                }}
                // disabled={!currentMarket}
              >
                Max
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid -gap-4 bg-bg-primary rounded-lg p-2 border border-transparent focus-within:border focus-within:border-border-brand ">
        <EnhancedNumericInput
          token={quoteToken}
          label={`Deposit ${quoteSliderValue}%`}
          value={Number(quoteDeposit).toFixed(quoteToken.displayDecimals)}
          inputClassName="bg-bg-primary"
          onChange={handleQuoteDepositChange}
          error={errors.quoteDeposit}
          showBalance
          balanceAction={{ onClick: handleQuoteDepositChange, text: "MAX" }}
        />
        <div className="grid -mt-1">
          <div className="flex items-center gap-1 ">
            <i className="text-text-quaternary">≈</i>
            <span className="text-xs text-text-secondary">...</span>
            <span className="text-xs text-text-quaternary">$</span>
          </div>

          <div className="space-y-5 px-3">
            <div className="flex justify-center space-x-2">
              {sliderValues.map((value) => (
                <Button
                  key={`percentage-button-${value}`}
                  variant={"secondary"}
                  size={"md"}
                  className={cn(
                    "!h-6 text-xs w-full !rounded-md flex items-center justify-center border-none",
                    {
                      "bg-bg-tertiary": quoteSliderValue === value,
                    },
                  )}
                  value={quoteSliderValue}
                  onClick={(e) => {
                    e.preventDefault()
                    handleQuoteSliderChange(Number(value))
                  }}
                  // disabled={!currentMarket}
                >
                  {value}%
                </Button>
              ))}
              <Button
                key={`percentage-button-max`}
                variant={"secondary"}
                size={"xs"}
                className={cn(
                  "!h-6 text-xs w-full !rounded-md flex items-center justify-center border-none",
                )}
                onClick={(e) => {
                  e.preventDefault()
                  handleQuoteSliderChange(Number(100))
                }}
                // disabled={!currentMarket}
              >
                Max
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Button
        className="w-full"
        onClick={() => setAddDialog(!addDialog)}
        disabled={isLoading || mintAmount === 0n}
      >
        Deposit
      </Button>
      <DepositToVaultDialog
        isOpen={addDialog}
        baseAmount={baseDeposit}
        quoteAmount={quoteDeposit}
        vault={vault}
        baseToken={baseToken}
        quoteToken={quoteToken}
        mintAmount={mintAmount}
        onClose={() => {
          setAddDialog(false)
          handleBaseDepositChange("0")
        }}
      />
    </form>
  )
}
