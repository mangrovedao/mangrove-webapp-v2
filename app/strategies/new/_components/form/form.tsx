"use client"
import React from "react"
import { useAccount, useBalance } from "wagmi"

import { TokenBalance } from "@/components/stateful/token-balance/token-balance"
import { EnhancedNumericInput } from "@/components/token-input"
import { Skeleton } from "@/components/ui/skeleton"
import useMarket from "@/providers/market"
import { cn } from "@/utils"
import { Fieldset } from "../fieldset"
import { InitialInventoryInfo } from "./components/initial-inventory-info"

export function Form({ className }: { className?: string }) {
  const { address } = useAccount()
  const { data: nativeBalance } = useBalance({
    address,
  })
  const { market } = useMarket()
  const baseToken = market?.base
  const quoteToken = market?.base
  const walletBalanceLabel = "Wallet balance"

  const [baseDeposit, setBaseDeposit] = React.useState("")
  const [quoteDeposit, setQuoteDeposit] = React.useState("")
  const [points, setPoints] = React.useState("")
  const [ratio, setRatio] = React.useState("")
  const [stepSize, setStepSize] = React.useState("")
  const [bounty, setBounty] = React.useState("")

  const handleBaseDepositChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBaseDeposit(e.target.value)
  }

  const handleQuoteDepositChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuoteDeposit(e.target.value)
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
          />
          <InitialInventoryInfo
            token={baseToken}
            value={0.119}
            action={{
              onClick: () => {},
              text: "Update",
            }}
          />
          <TokenBalance
            label="Wallet balance"
            token={baseToken}
            action={{
              onClick: () => {},
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
          />

          <InitialInventoryInfo
            token={quoteToken}
            value={0.119}
            action={{
              onClick: () => {},
              text: "Update",
            }}
          />
          <TokenBalance
            label="Wallet balance"
            token={quoteToken}
            action={{
              onClick: () => {},
              text: "MAX",
            }}
          />
        </div>
      </Fieldset>

      <Fieldset legend="Settings">
        <EnhancedNumericInput label="Number of price points" />
        <EnhancedNumericInput label="Ratio" />
        <EnhancedNumericInput label="Step size" />
      </Fieldset>

      <Fieldset legend="Bounty">
        <EnhancedNumericInput
          label={`${nativeBalance?.symbol} deposit`}
          token={nativeBalance?.symbol}
          showBalance
          balanceLabel={walletBalanceLabel}
        />
      </Fieldset>
    </form>
  )
}
