"use client"
import { useQuery } from "@tanstack/react-query"
import React from "react"
import { useDebounceCallback } from "usehooks-ts"

import { maxUint256, parseAbi, PublicClient } from "viem"
import { Vault } from "../../(shared)/types"

export type MintAmountsArgs = {
  vault?: Vault
  client?: PublicClient
}

export type MintAmountsResult = {
  setBaseAmount: (amount: bigint) => void
  setQuoteAmount: (amount: bigint) => void
  mintAmount: bigint
  baseAmount: bigint
  quoteAmount: bigint
}

export function useMintAmounts({ vault, client }: MintAmountsArgs) {
  const [amountAndSide, setAmountAndSide] = React.useState<{
    amount: bigint
    side: "base" | "quote"
  }>()

  //
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["mint-amounts", vault?.address, amountAndSide?.side, client],
    queryFn: async () => {
      if (!amountAndSide || !vault) throw new Error("Invalid state")
      if (!client) return undefined

      const args: [bigint, bigint] =
        amountAndSide.side === "base"
          ? [amountAndSide.amount, maxUint256]
          : [maxUint256, amountAndSide.amount]

      const mintAmounts = await client.readContract({
        address: vault.address,
        abi: parseAbi([
          "function getMintAmounts(uint256 baseAmountMax, uint256 quoteAmountMax) external view returns (uint256 baseAmountOut, uint256 quoteAmountOut, uint256 shares)",
        ]),
        functionName: "getMintAmounts",
        args,
      })

      const baseAmount = mintAmounts[0]
      const quoteAmount = mintAmounts[1]
      const mintAmount = mintAmounts[2]

      return { baseAmount, quoteAmount, mintAmount, side: amountAndSide.side }
    },
    enabled: !!amountAndSide?.amount && !!vault?.address,
  })

  React.useEffect(() => {
    refetch()
  }, [amountAndSide])

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
      baseAmount:
        undebouncedAmountAndSide?.side === "base"
          ? undebouncedAmountAndSide.amount
          : 0n,
      quoteAmount:
        undebouncedAmountAndSide?.side === "quote"
          ? undebouncedAmountAndSide.amount
          : 0n,
      mintAmount: 0n,
      side: undebouncedAmountAndSide?.side,
    },
    isLoading,
    isError,
    setBaseAmount: (amount: bigint) => setAmountAndSideCallback(amount, "base"),
    setQuoteAmount: (amount: bigint) =>
      setAmountAndSideCallback(amount, "quote"),
  }
}
