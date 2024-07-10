import { useMarkets } from "@/hooks/use-addresses"
import useKandel from "../_providers/kandel-strategy"

export default function useKandelMarket() {
  const { baseToken, quoteToken } = useKandel()
  const markets = useMarkets()

  const kandelMarket = markets?.find(
    (market) =>
      market.base.address.toLocaleLowerCase() ===
        baseToken?.address.toLocaleLowerCase() &&
      market.quote.address.toLocaleLowerCase() ===
        quoteToken?.address.toLocaleLowerCase(),
  )

  try {
    if (!kandelMarket) return null
    return kandelMarket
  } catch (error) {
    console.error(error)
    throw new Error("failed to fetch mangrove client")
  }
}
