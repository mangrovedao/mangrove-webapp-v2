import Big from "big.js"
import React from "react"
import { useAccount, useBalance } from "wagmi"

import useKandel from "../../../_providers/kandel-strategy"
import { MergedOffers } from "../../../_utils/inventory"

export const useParameters = () => {
  const [unPublishedBase, setUnpublishedBase] = React.useState("")
  const [unPublishedQuote, setUnPublishedQuote] = React.useState("")
  const [unallocatedBase, setUnallocatedBase] = React.useState("")
  const [unallocatedQuote, setUnallocatedQuote] = React.useState("")

  const { strategyStatusQuery, strategyQuery, mergedOffers } = useKandel()

  const { address } = useAccount()
  const { data: nativeBalance } = useBalance({
    address,
  })

  const {
    book,
    market,
    asksBalance,
    bidsBalance,
    offerStatuses,
    stratInstance,
  } = strategyStatusQuery.data ?? {}

  const {
    depositedBase,
    offers,
    depositedQuote,
    currentParameter,
    creationDate,
    address: strategyAddress,
    depositAndWithdraw,
  } = strategyQuery.data ?? {}

  const { maxPrice, minPrice, priceRatio } = offerStatuses ?? {}

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
    .toFixed(nativeBalance?.decimals ?? 4)

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
            ? Big(offer[key])
            : Big(0),
        ),
      Big(0),
    )
  }

  const getUnpublishedBalances = async () => {
    const asks = await stratInstance?.getUnpublished("asks")
    const bids = await stratInstance?.getUnpublished("bids")

    return [asks, bids]
  }

  React.useEffect(() => {
    const fetchUnpublishedBalancesAndBounty = async () => {
      const [base, quote] = await getUnpublishedBalances()

      if (!base || !quote || !asksBalance || !bidsBalance) return

      const { unallocatedBase, unallocatedQuote } = getUnallocatedInventory(
        { base: asksBalance, quote: bidsBalance },
        { base: publishedBase, quote: publishedQuote },
      )

      setUnpublishedBase(base.toFixed(market?.base?.decimals))
      setUnPublishedQuote(quote.toFixed(market?.base?.decimals))
      setUnallocatedBase(unallocatedBase.toFixed(market?.base?.decimals))
      setUnallocatedQuote(unallocatedQuote.toFixed(market?.quote?.decimals))
    }

    fetchUnpublishedBalancesAndBounty()
  }, [strategyStatusQuery.data])

  return {
    depositAndWithdraw,
    quote: market?.quote,
    base: market?.base,
    currentParameter: {
      ...currentParameter,
      lockedBounty,
      maxPrice,
      minPrice,
      priceRatio,
      creationDate,
      strategyAddress,
    },
    unallocatedBase,
    unallocatedQuote,
    unPublishedBase,
    unPublishedQuote,
    depositedBase,
    depositedQuote,
  }
}
