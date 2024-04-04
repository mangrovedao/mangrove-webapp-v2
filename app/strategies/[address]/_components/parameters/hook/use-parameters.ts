import Big from "big.js"
import React from "react"
import { useAccount, useBalance, usePublicClient } from "wagmi"

import { usePnL } from "@/app/strategies/(shared)/_hooks/use-pnl"
import { Address, erc20Abi, formatUnits } from "viem"
import useKandel from "../../../_providers/kandel-strategy"
import { MergedOffers } from "../../../_utils/inventory"

export const useParameters = () => {
  const [unPublishedBase, setUnpublishedBase] = React.useState("")
  const [unPublishedQuote, setUnPublishedQuote] = React.useState("")
  const [withdrawBase, setWithdrawableBase] = React.useState("")
  const [withdrawQuote, setWithdrawableQuote] = React.useState("")

  const { strategyStatusQuery, strategyQuery, mergedOffers } = useKandel()

  const { address } = useAccount()
  const { data: nativeBalance } = useBalance({
    address,
  })

  const { market, offerStatuses, stratInstance } =
    strategyStatusQuery.data ?? {}

  const {
    depositedBase,
    offers,
    depositedQuote,
    currentParameter,
    creationDate,
    address: strategyAddress,
    depositsAndWithdraws,
  } = strategyQuery.data ?? {}

  const { pnlQuote, returnRate } =
    usePnL({ kandelAddress: strategyAddress }).data ?? {}

  const { maxPrice, minPrice } = offerStatuses ?? {}

  const asks =
    offers
      ?.filter((item) => item.offerType === "asks")
      .map(({ gasbase, gasreq, gasprice }) => ({
        gasbase: Number(gasbase || 0),
        gasreq: Number(gasreq || 0),
        gasprice: Number(gasprice || 0),
      })) || []

  const bids =
    offers
      ?.filter((item) => item.offerType === "bids")
      .map(({ gasbase, gasreq, gasprice }) => ({
        gasbase: Number(gasbase || 0),
        gasreq: Number(gasreq || 0),
        gasprice: Number(gasprice || 0),
      })) || []

  const lockedBounty = stratInstance
    ?.getLockedProvisionFromOffers({
      asks,
      bids,
    })
    .toFixed(nativeBalance?.decimals ?? 6)

  const publishedBase = getPublished(mergedOffers as MergedOffers, "asks")
  const publishedQuote = getPublished(mergedOffers as MergedOffers, "bids")

  function getUnallocatedInventory(
    deposited: { base: Big; quote: Big },
    published: { base: Big; quote: Big },
  ) {
    const unallocatedBase = deposited.base.sub(published.base)
    const unallocatedQuote = deposited.quote.sub(published.quote)

    return { unallocatedBase, unallocatedQuote }
  }

  function getPublished(
    mergedOffers: MergedOffers,
    offerType: "asks" | "bids",
  ) {
    if (!mergedOffers) return Big(0)

    const key = offerType === "asks" ? "base" : "quote"
    return mergedOffers.reduce(
      (acc: Big, offer) =>
        acc.add(
          offer.live && offer.offerType === offerType
            ? Big(offer.gives)
            : Big(0),
        ),
      Big(0),
    )
  }

  const getUnpublishedBalances = async () => {
    const asks = await stratInstance?.getUnpublished("asks")
    const bids = await stratInstance?.getUnpublished("bids")
    // TODO: fixe the negative values
    return [asks, bids]
  }

  const publicClient = usePublicClient()

  const getWithdawableBalances = async () => {
    if (!publicClient) return

    const [base, quote] = await publicClient.multicall({
      contracts: [
        {
          address: market?.base.address as Address,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [strategyAddress as Address],
        },
        {
          address: market?.quote.address as Address,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [strategyAddress as Address],
        },
      ],
      allowFailure: false,
    })

    return [
      formatUnits(base, (market?.base.decimals as number) ?? 0),
      formatUnits(quote, (market?.quote.decimals as number) ?? 0),
    ]
  }
  React.useEffect(() => {
    const fetchUnpublishedBalancesAndBounty = async () => {
      const [base, quote] = await getUnpublishedBalances()
      const [baseWithdraw, quoteWithdraw] =
        (await getWithdawableBalances()) ?? []

      setWithdrawableBase(
        Number(baseWithdraw ?? 0).toFixed(market?.base.displayedDecimals),
      )
      setWithdrawableQuote(
        Number(quoteWithdraw ?? 0).toFixed(market?.quote.displayedDecimals),
      )

      setUnpublishedBase(
        Number(base ?? 0).toFixed(market?.base.displayedDecimals),
      )
      setUnPublishedQuote(
        Number(quote ?? 0).toFixed(market?.quote.displayedDecimals),
      )
    }

    fetchUnpublishedBalancesAndBounty()
  }, [strategyStatusQuery.data])

  return {
    depositsAndWithdraws,
    quote: market?.quote,
    base: market?.base,
    currentParameter: {
      ...currentParameter,
      lockedBounty,
      nativeSymbol: nativeBalance?.symbol,
      maxPrice,
      minPrice,
      creationDate,
      strategyAddress,
      pnlQuote:
        pnlQuote === "closed"
          ? "Closed"
          : pnlQuote && market?.quote.symbol
            ? `${Number(pnlQuote ?? 0).toFixed(market?.quote.displayedDecimals)} ${market?.quote.symbol}`
            : "",
      returnRate:
        returnRate === "closed"
          ? "Closed"
          : returnRate && market?.quote.symbol
            ? `${Number(returnRate ?? 0).toFixed(market?.quote.displayedDecimals)} ${market?.quote.symbol}`
            : "",
    },
    withdrawBase,
    withdrawQuote,
    publishedBase,
    publishedQuote,
    unPublishedBase,
    unPublishedQuote,
    depositedBase,
    depositedQuote,
  }
}
