"use client"

import { EnhancedNumericInput } from "@/components/token-input-new"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useTokenBalance } from "@/hooks/use-balances"
import { cn } from "@/utils"
import React from "react"
import AddToVaultDialog from "./dialogs/add-dialog"
import useForm from "./use-form"

const sliderValues = [25, 50, 75]

export function DepositForm({ className }: { className?: string }) {
  const [addDialog, setAddDialog] = React.useState(false)

  const {
    baseToken,
    quoteToken,
    baseDeposit,
    quoteDeposit,
    mintAmount,
    vault,
    errors,
    handleBaseDepositChange,
    handleQuoteDepositChange,
    isLoading,
  } = useForm()
  const { balance: baseBalance, isLoading: baseBalanceIsLoading } =
    useTokenBalance({
      token: baseToken?.address,
    })

  const baseDepositSliderValue =
    Number(baseDeposit) !== 0
      ? ((Number(baseDeposit) / Number(baseBalance)) * 100).toFixed(0)
      : 0

  const { balance: quoteBalance, isLoading: quoteBalanceIsLoading } =
    useTokenBalance({
      token: quoteToken?.address,
    })

  const quoteDepositSliderValue =
    Number(quoteDeposit) !== 0
      ? ((Number(quoteDeposit) / Number(quoteBalance)) * 100).toFixed(0)
      : 0

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
          label={`Deposit 80%`}
          inputClassName="bg-bg-primary"
          value={baseDeposit}
          onChange={handleBaseDepositChange}
          error={errors.baseDeposit}
          showBalance
          balanceAction={{ onClick: handleBaseDepositChange, text: "MAX" }}
        />
        <div className="grid -mt-1">
          <div className="flex items-center gap-1 ">
            <i className="text-text-quaternary">≈</i>
            <span className="text-xs text-text-secondary">0</span>
            <span className="text-xs text-text-quaternary">$</span>
          </div>

          <div className="space-y-5 px-3">
            <div className="flex justify-center space-x-2">
              {sliderValues.map((value) => (
                <Button
                  key={`percentage-button-${value}`}
                  variant={"secondary"}
                  size={"xs"}
                  className={cn(
                    "!h-6 text-xs w-full !rounded-md flex items-center justify-center border-none",
                  )}
                  onClick={(e) => {
                    e.preventDefault()
                    console.log(e)
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
                  console.log(e)
                }}
                // disabled={!currentMarket}
              >
                Max
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid -gap-4 bg-bg-primary rounded-lg p-2 focus-within:border focus-within:border-border-brand">
        <EnhancedNumericInput
          token={quoteToken}
          label={`Deposit 20%`}
          value={quoteDeposit}
          inputClassName="bg-bg-primary"
          onChange={handleQuoteDepositChange}
          error={errors.quoteDeposit}
          showBalance
          balanceAction={{ onClick: handleQuoteDepositChange, text: "MAX" }}
        />
        <div className="grid -mt-1">
          <div className="flex items-center gap-1 ">
            <i className="text-text-quaternary">≈</i>
            <span className="text-xs text-text-secondary">0</span>
            <span className="text-xs text-text-quaternary">$</span>
          </div>

          <div className="space-y-5 px-3">
            <div className="flex justify-center space-x-2">
              {sliderValues.map((value) => (
                <Button
                  key={`percentage-button-${value}`}
                  variant={"secondary"}
                  size={"xs"}
                  className={cn(
                    "!h-6 text-xs w-full !rounded-md flex items-center justify-center border-none",
                  )}
                  onClick={(e) => {
                    e.preventDefault()
                    console.log(e)
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
                  console.log(e)
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
      <AddToVaultDialog
        isOpen={addDialog}
        baseAmount={baseDeposit}
        quoteAmount={quoteDeposit}
        vault={vault}
        baseToken={baseToken}
        quoteToken={quoteToken}
        mintAmount={mintAmount}
        onClose={() => setAddDialog(false)}
      />
    </form>
  )
}
