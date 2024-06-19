import React from "react"
import { Address, erc20Abi, formatUnits } from "viem"
import { useAccount, useBalance, usePublicClient } from "wagmi"

import { usePnL } from "@/app/strategies/(shared)/_hooks/use-pnl"
import useKandel from "../../../_providers/kandel-strategy"

export const useParameters = () => {
  const [withdrawBase, setWithdrawableBase] = React.useState("")
  const [withdrawQuote, setWithdrawableQuote] = React.useState("")

  const { strategyStatusQuery, strategyQuery, baseToken, quoteToken } =
    useKandel()
  const publicClient = usePublicClient()

  const { address } = useAccount()
  const { data: nativeBalance } = useBalance({
    address,
  })

  const { kandelInstance, kandelState, maxPrice, minPrice } =
    strategyStatusQuery.data ?? {}

  const {
    depositedBase,
    depositedQuote,
    currentParameter,
    creationDate,
    address: strategyAddress,
    depositsAndWithdraws,
    parametersHistoric,
  } = strategyQuery.data ?? {}

  const { pnlQuote, returnRate } =
    usePnL({ kandelAddress: strategyAddress }).data ?? {}

  // const { asksBalance, bidsBalance } =
  //   useQuery({
  //     queryKey: [
  //       "strategy-balance",
  //       strategyAddress,
  //       baseToken?.address,
  //       quoteToken?.address,
  //     ],
  //     queryFn: async () => {
  //       try {
  //         if (!kandelInstance) throw new Error("Could fetch balances")

  //         const kandelState = await kandelInstance.getKandelState({})
  //         const [asksBalance, bidsBalance] = await Promise.all([
  //           kandelState.asks.reduce(
  //             (sum, ask) =>
  //               sum.plus(formatUnits(ask.gives, baseToken?.decimals || 18)),
  //             Big(0),
  //           ),
  //           kandelState.bids.reduce(
  //             (sum, bid) =>
  //               sum.plus(formatUnits(bid.gives, quoteToken?.decimals || 18)),
  //             Big(0),
  //           ),
  //         ])

  //         // const asks = kandelState.asks.map((item) =>
  //         //   Number(formatUnits(item.gives, baseToken?.decimals || 18)),
  //         // )
  //         // const bids = kandelState.bids.map((item) =>
  //         //   Number(formatUnits(item.gives, quoteToken?.decimals || 18)),
  //         // )
  //         // const asksBalance = asks.reduce(function (prev, cur) {
  //         //   return prev + cur
  //         // })
  //         // const bidsBalance = bids.reduce(function (prev, cur) {
  //         //   return prev + cur
  //         // })

  //         return { asksBalance, bidsBalance }
  //       } catch (error) {
  //         console.error(error)
  //       }
  //     },
  //     initialData: { asksBalance: Big(0), bidsBalance: Big(0) },
  //   }).data ?? {}

  const lockedBounty = Number(kandelState?.unlockedProvision ?? 0).toFixed(
    nativeBalance?.decimals ?? 18,
  )

  const getWithdawableBalances = async () => {
    if (!publicClient || !baseToken?.address || !quoteToken?.address) return

    const [base, quote] = await publicClient.multicall({
      contracts: [
        {
          address: baseToken?.address as Address,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [strategyAddress as Address],
        },
        {
          address: quoteToken?.address as Address,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [strategyAddress as Address],
        },
      ],
      allowFailure: false,
    })

    return [
      formatUnits(base, (baseToken?.decimals as number) ?? 0),
      formatUnits(quote, (quoteToken?.decimals as number) ?? 0),
    ]
  }

  React.useEffect(() => {
    const fetchUnpublishedBalancesAndBounty = async () => {
      // const [base, quote] = await getUnpublishedBalances()
      const [baseWithdraw, quoteWithdraw] =
        (await getWithdawableBalances()) ?? []

      setWithdrawableBase(
        Number(baseWithdraw ?? 0).toFixed(baseToken?.displayDecimals),
      )
      setWithdrawableQuote(
        Number(quoteWithdraw ?? 0).toFixed(quoteToken?.displayDecimals),
      )
    }

    fetchUnpublishedBalancesAndBounty()
  }, [strategyStatusQuery.data, baseToken, quoteToken])

  return {
    depositsAndWithdraws,
    parametersHistoric,
    quote: quoteToken,
    base: baseToken,
    currentParameter: {
      ...currentParameter,
      lockedBounty,
      nativeSymbol: nativeBalance?.symbol,
      maxPrice,
      minPrice,
      creationDate,
      strategyAddress,
      pnlQuote:
        // "Upcoming",
        pnlQuote === "Upcoming"
          ? "Upcoming"
          : pnlQuote && quoteToken?.symbol
            ? `${Number(pnlQuote ?? 0).toFixed(quoteToken?.displayDecimals)} ${quoteToken?.symbol}`
            : "",
      returnRate:
        // "Upcoming"

        returnRate === "Upcoming"
          ? "Upcoming"
          : returnRate && quoteToken?.symbol
            ? `${Number(returnRate ?? 0).toFixed(quoteToken?.displayDecimals)} ${quoteToken?.symbol}`
            : "",
    },
    withdrawBase,
    withdrawQuote,
    publishedBase: formatUnits(
      kandelState?.baseAmount || 0n,
      baseToken?.decimals || 18,
    ),
    publishedQuote: formatUnits(
      kandelState?.quoteAmount || 0n,
      quoteToken?.decimals || 18,
    ),
    depositedBase,
    depositedQuote,
  }
}
