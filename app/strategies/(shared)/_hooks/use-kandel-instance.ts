import { kandelActions } from "@mangrovedao/mgv"
import { Address } from "viem"

import { Strategy } from "@/app/strategies/(list)/_schemas/kandels"
import { useMangroveAddresses } from "@/hooks/use-addresses"
import useMarket from "@/providers/market.new"
import { useClient } from "wagmi"

type Params = Partial<Pick<Strategy, "address" | "base" | "quote">>

export default function useKandelInstance({ address, base, quote }: Params) {
  const client = useClient()
  const { markets } = useMarket()
  const addresses = useMangroveAddresses()

  try {
    if (!address || !base || !quote) return null

    const market = markets?.find((market) => {
      return (
        market.base.address?.toLowerCase() === base?.toLowerCase() &&
        market.quote.address?.toLowerCase() === quote?.toLowerCase()
      )
    })

    if (!(market && addresses)) return null

    const kandelInstance = client?.extend(
      kandelActions(
        addresses,
        market, // the market object
        address as Address, // the kandel seeder address
      ),
    )

    return kandelInstance
  } catch (error) {
    console.error(error)
    throw new Error("failed to fetch kandel instance")
  }
}
