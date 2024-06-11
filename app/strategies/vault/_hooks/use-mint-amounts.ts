"use client"
import { useTokenBalance } from "@/hooks/use-balances"
import { useQuery } from "@tanstack/react-query"
import React from "react"
import type { Vault } from "../../(list)/_schemas/vaults"

export type MintAmountsArgs = {
  vault: Vault
}

export type MintAmountsResult = {
  setBaseAmount: (amount: bigint) => void
  setQuoteAmount: (amount: bigint) => void
  amount0: bigint
  amount1: bigint
  mintAmount: bigint
  baseAmount: bigint
  quoteAmount: bigint
}

export function useMintAmounts({ vault }: MintAmountsArgs) {
  const { balance: baseBalance } = useTokenBalance({
    token: vault.market.base.address,
  })
  const { balance: quoteBalance } = useTokenBalance({
    token: vault.market.quote.address,
  })

  const [amountAndSide, setAmountAndSide] = React.useState<{
    amount: bigint
    side: "base" | "quote"
  }>()

  // const [_baseAmount, setBaseAmount] = React.useState<bigint>(0n)
  // const [_quoteAmount, setQuoteAmount] = React.useState<bigint>(0n)

  // const amount0 = React.useMemo(() => {
  //   return vault.baseIsToken0 ? _baseAmount : quoteAmount
  // }, [_baseAmount, quoteAmount, vault.baseIsToken0])
  // const amount1 = React.useMemo(() => {
  //   return vault.baseIsToken0 ? quoteAmount : _baseAmount
  // }, [_baseAmount, quoteAmount, vault.baseIsToken0])

  const {} = useQuery({
    queryKey: [
      "mint-amounts",
      vault.address,
      amountAndSide?.amount.toString(),
      amountAndSide?.side,
    ],
    queryFn: async () => {
      if (!amountAndSide || !baseBalance || !quoteBalance)
        throw new Error("Invalid state")
    },
    enabled: !!amountAndSide && !!baseBalance && !!quoteBalance,
  })
}
