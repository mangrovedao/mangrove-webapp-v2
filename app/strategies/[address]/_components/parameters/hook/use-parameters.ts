import React from "react"

import Big from "big.js"
import useKandel from "../../../_providers/kandel-strategy"
import { MergedOffers } from "../../../_utils/inventory"

export const useParameters = () => {
  const [unPublishedBase, setUnpublishedBase] = React.useState("")
  const [unPublishedQuote, setUnPublishedQuote] = React.useState("")
  const [unallocatedBase, setUnallocatedBase] = React.useState("")
  const [unallocatedQuote, setUnallocatedQuote] = React.useState("")
  const [bounty, setBounty] = React.useState("")

  const { strategyStatusQuery, strategyQuery, mergedOffers } = useKandel()

  const { market, asksBalance, bidsBalance, offerStatuses } =
    strategyStatusQuery.data ?? {}

  const { depositedBase, depositedQuote, currentParameter } =
    strategyQuery.data ?? {}

  const { maxPrice, minPrice, priceRatio } = offerStatuses ?? {}

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
    const asks =
      await strategyStatusQuery.data?.stratInstance.getUnpublished("asks")
    const bids =
      await strategyStatusQuery.data?.stratInstance.getUnpublished("bids")

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
      //   setBounty(bountyAmount)
    }

    fetchUnpublishedBalancesAndBounty()
  }, [strategyStatusQuery.data, strategyQuery.data])

  return {
    maxPrice,
    minPrice,
    priceRatio,
    currentParameter,
    unallocatedBase,
    unallocatedQuote,
    unPublishedBase,
    unPublishedQuote,
    depositedBase,
    depositedQuote,
    bounty,
  }
}
