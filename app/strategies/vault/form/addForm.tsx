"use client"

import { EnhancedNumericInput } from "@/components/token-input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/utils"
import useForm from "./use-form"

export function AddForm({ className }: { className?: string }) {
  const {
    address,
    baseToken,
    quoteToken,
    baseDeposit,
    quoteDeposit,
    nativeBalance,
    baseBalance,
    quoteBalance,
    errors,
    handleBaseDepositChange,
    handleQuoteDepositChange,
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
      <Button rightIcon className="w-full">
        Add
      </Button>
    </form>
  )
}
