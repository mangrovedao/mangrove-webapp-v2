"use client"

import React from "react"
import { formatUnits } from "viem"

import { EnhancedNumericInput } from "@/components/token-input-new"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/utils"
import { currentDecimals } from "@/utils/market"
import DepositToVaultDialog from "./dialogs/deposit-dialog"
import useForm from "./use-form"

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
    hasErrors,
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
    if (baseBalance?.balance !== 0n) {
      handleBaseSliderChange(25)
    } else if (quoteBalance?.balance !== 0n) {
      handleQuoteSliderChange(25)
    } else {
      errors.baseDeposit = "No balance"
      errors.quoteDeposit = "No balance"
    }
  }, [vault])

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
        disabled={
          (vault?.totalBase === 0n && vault?.totalQuote !== 0n) ||
          baseBalance?.balance === 0n
        }
        dollarAmount={
          (Number(baseDeposit) * (vault?.baseDollarPrice || 0)).toFixed(3) ||
          "..."
        }
        label={`Deposit ${baseSliderValue}%`}
        inputClassName="bg-bg-primary"
        value={Number(baseDeposit).toFixed(currentDecimals(baseToken))}
        onChange={handleBaseDepositChange}
        error={errors.baseDeposit}
        showBalance
        balanceAction={{ onClick: handleBaseDepositChange, text: "MAX" }}
      />

      <EnhancedNumericInput
        sendSliderValue={quoteSliderValue}
        setSendSliderValue={handleQuoteSliderChange}
        token={quoteToken}
        disabled={
          (vault?.totalQuote === 0n && vault?.totalBase !== 0n) ||
          quoteBalance?.balance === 0n
        }
        dollarAmount={
          (Number(quoteDeposit) * (vault?.quoteDollarPrice || 0)).toFixed(3) ||
          "..."
        }
        label={`Deposit ${quoteSliderValue}%`}
        value={Number(quoteDeposit).toFixed(currentDecimals(quoteToken))}
        inputClassName="bg-bg-primary"
        onChange={handleQuoteDepositChange}
        error={errors.quoteDeposit}
        showBalance
        balanceAction={{ onClick: handleQuoteDepositChange, text: "MAX" }}
      />

      <Button
        className="w-full"
        onClick={() => setAddDialog(!addDialog)}
        disabled={isLoading || mintAmount === 0n || hasErrors}
      >
        Deposit
      </Button>
      {addDialog ? (
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
          }}
        />
      ) : undefined}
    </form>
  )
}
