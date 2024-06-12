"use client"

import { EnhancedNumericInput } from "@/components/token-input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/utils"
import React from "react"
import AddToVaultDialog from "./dialogs/add-dialog"
import useForm from "./use-form"

export function AddForm({ className }: { className?: string }) {
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
      <div>
        <EnhancedNumericInput
          token={baseToken}
          label={`${baseToken?.symbol} amount`}
          value={baseDeposit}
          onChange={handleBaseDepositChange}
          error={errors.baseDeposit}
          showBalance
          balanceAction={{ onClick: handleBaseDepositChange, text: "MAX" }}
        />
      </div>

      <div>
        <EnhancedNumericInput
          token={quoteToken}
          label={`${quoteToken?.symbol} amount`}
          value={quoteDeposit}
          onChange={handleQuoteDepositChange}
          error={errors.quoteDeposit}
          showBalance
          balanceAction={{ onClick: handleQuoteDepositChange, text: "MAX" }}
        />
      </div>
      <Button
        rightIcon
        className="w-full"
        onClick={() => setAddDialog(!addDialog)}
        disabled={isLoading || mintAmount === 0n}
      >
        Add
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
