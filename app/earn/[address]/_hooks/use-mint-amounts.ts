"use client"
import { useTokenBalance } from "@/hooks/use-balances"
import { useQuery } from "@tanstack/react-query"
import React from "react"
import { useDebounceCallback } from "usehooks-ts"
import { usePublicClient } from "wagmi"

import { getMintAmount } from "../../(shared)/_service/mint-vault"
import { Vault } from "../../(shared)/types"

export type MintAmountsArgs = {
  vault?: Vault
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
  const { balance: baseBalance, isLoading: loadingBase } = useTokenBalance({
    token: vault?.market.base.address,
  })
  const { balance: quoteBalance, isLoading: loadingQuote } = useTokenBalance({
    token: vault?.market.quote.address,
  })

  const [amountAndSide, setAmountAndSide] = React.useState<{
    amount: bigint
    side: "base" | "quote"
  }>()

  const client = usePublicClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: [
      "mint-amounts",
      vault?.address,
      amountAndSide?.amount.toString(),
      amountAndSide?.side,
      baseBalance?.balance?.toString(),
      quoteBalance?.balance?.toString(),
      client,
    ],
    queryFn: async () => {
      if (!amountAndSide || !baseBalance || !quoteBalance || !vault)
        throw new Error("Invalid state")
      if (!client) return undefined
      let baseAmount =
        amountAndSide.side === "base"
          ? amountAndSide.amount
          : baseBalance.balance
      let quoteAmount =
        amountAndSide.side === "quote"
          ? amountAndSide.amount
          : quoteBalance.balance
      const { amount0, amount1, mintAmount } = await getMintAmount(client, {
        vault: vault.address,
        amount0: baseAmount,
        amount1: quoteAmount,
      })
      //
      // Mock impl
      // let baseAmount =
      //   amountAndSide.side === "base"
      //     ? amountAndSide.amount
      //     : amountAndSide.amount / 3000n
      // let quoteAmount =
      //   amountAndSide.side === "quote"
      //     ? amountAndSide.amount
      //     : amountAndSide.amount * 3000n
      // const amount0 = vault.baseIsToken0 ? baseAmount : quoteAmount
      // const amount1 = vault.baseIsToken0 ? quoteAmount : baseAmount
      // const mintAmount = amount0
      // end mock impl

      baseAmount = amount0
      quoteAmount = amount1
      return {
        amount0,
        amount1,
        mintAmount,
        baseAmount,
        quoteAmount,
      }
    },
    enabled:
      !!amountAndSide &&
      !!baseBalance &&
      !!quoteBalance &&
      !loadingBase &&
      !!vault &&
      !loadingQuote,
  })

  const [undebouncedAmountAndSide, setUndebouncedAmountAndSide] =
    React.useState<{
      amount: bigint
      side: "base" | "quote"
    }>()

  const deboundedSetAmountAndSide = useDebounceCallback(
    (amount: bigint, side: "base" | "quote") => {
      setAmountAndSide({ amount, side })
    },
    1000,
  )

  const setAmountAndSideCallback = (amount: bigint, side: "base" | "quote") => {
    setUndebouncedAmountAndSide({ amount, side })
    deboundedSetAmountAndSide(amount, side)
  }

  return {
    data: data || {
      amount0: 0n,
      amount1: 0n,
      mintAmount: 0n,
      baseAmount:
        undebouncedAmountAndSide?.side === "base"
          ? undebouncedAmountAndSide.amount
          : 0n,
      quoteAmount:
        undebouncedAmountAndSide?.side === "quote"
          ? undebouncedAmountAndSide.amount
          : 0n,
    },
    isLoading:
      isLoading ||
      loadingBase ||
      loadingQuote ||
      amountAndSide?.side !== undebouncedAmountAndSide?.side ||
      amountAndSide?.amount !== undebouncedAmountAndSide?.amount,
    isError,
    setBaseAmount: (amount: bigint) => setAmountAndSideCallback(amount, "base"),
    setQuoteAmount: (amount: bigint) =>
      setAmountAndSideCallback(amount, "quote"),
  }
}
