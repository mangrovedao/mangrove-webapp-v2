import { useMarkets } from "@/hooks/use-addresses"
import { MarketParams } from "@mangrovedao/mgv"
import useKandel from "../_providers/kandel-strategy"

export default function useKandelMarket(): MarketParams | null {
  const { baseToken, quoteToken } = useKandel()
  const markets = useMarkets()

  let kandelMarket: MarketParams | undefined = markets?.find(
    (market) =>
      market.base.address.toLocaleLowerCase() ===
        baseToken?.address.toLocaleLowerCase() &&
      market.quote.address.toLocaleLowerCase() ===
        quoteToken?.address.toLocaleLowerCase(),
  ) as unknown as MarketParams

  try {
    if (!kandelMarket) return null
    return kandelMarket as MarketParams
  } catch (error) {
    console.error(error)
    throw new Error("failed to fetch mangrove client")
  }
}
