import { kandelActions } from "@mangrovedao/mgv"
import { useQuery } from "@tanstack/react-query"

import { useMangroveAddresses } from "@/hooks/use-addresses"
import useMarket from "@/providers/market.new"
import { getErrorMessage } from "@/utils/errors"
import { Address } from "viem"
import { useAccount, useClient, usePublicClient } from "wagmi"
import useKandel from "../_providers/kandel-strategy"

export function useKandelSteps() {
  const { address } = useAccount()
  const { markets } = useMarket()
  const { baseToken, quoteToken } = useKandel()
  const client = useClient()

  const addresses = useMangroveAddresses()
  const publicClient = usePublicClient()

  const currentMarket = markets.find(
    (market) =>
      market.base.address.toLocaleLowerCase() ===
        baseToken?.address.toLocaleLowerCase() &&
      market.quote.address.toLocaleLowerCase() ===
        quoteToken?.address.toLocaleLowerCase(),
  )

  return useQuery({
    queryKey: [
      "kandel-steps",
      address,
      baseToken?.address,
      quoteToken?.address,
    ],
    queryFn: async () => {
      try {
        if (!baseToken || !quoteToken) return null
        if (
          !address ||
          !publicClient ||
          !addresses ||
          !client ||
          !currentMarket
        )
          throw new Error("Could not fetch kandel steps, missing params")

        const kandelInstance = client?.extend(
          kandelActions(
            addresses,
            currentMarket, // the market object
            address as Address, // the kandel seeder address
          ),
        )

        const currentSteps = await kandelInstance.getKandelSteps({
          user: address,
        })

        return currentSteps
      } catch (e) {
        console.error(getErrorMessage(e))
        throw new Error("Unable to retrieve kandel steps")
      }
    },
    enabled: !!address,
    meta: {
      error: "Unable to retrieve kandel steps",
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}
