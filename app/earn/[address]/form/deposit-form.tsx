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
      <EnhancedNumericInput
        sendSliderValue={baseSliderValue}
        setSendSliderValue={handleBaseSliderChange}
        token={baseToken}
        dollarAmount={"..."}
        label={`Deposit ${baseSliderValue}%`}
        inputClassName="bg-bg-primary"
        value={Number(baseDeposit).toFixed(baseToken.displayDecimals)}
        onChange={handleBaseDepositChange}
        error={errors.baseDeposit}
        showBalance
        balanceAction={{ onClick: handleBaseDepositChange, text: "MAX" }}
      />

      <EnhancedNumericInput
        sendSliderValue={quoteSliderValue}
        setSendSliderValue={handleQuoteSliderChange}
        token={quoteToken}
        dollarAmount={"..."}
        label={`Deposit ${quoteSliderValue}%`}
        value={Number(quoteDeposit).toFixed(quoteToken.displayDecimals)}
        inputClassName="bg-bg-primary"
        onChange={handleQuoteDepositChange}
        error={errors.quoteDeposit}
        showBalance
        balanceAction={{ onClick: handleQuoteDepositChange, text: "MAX" }}
      />

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
