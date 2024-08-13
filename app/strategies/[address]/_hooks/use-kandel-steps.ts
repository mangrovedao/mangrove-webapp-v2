import { kandelSeederActions } from "@mangrovedao/mgv"
import { useQuery } from "@tanstack/react-query"

import {
  aaveKandelSeeder,
  useKandelSeeder,
  useMangroveAddresses,
} from "@/hooks/use-addresses"
import useMarket from "@/providers/market.new"
import { getErrorMessage } from "@/utils/errors"
import { useAccount, useClient, usePublicClient } from "wagmi"
import useKandel from "../_providers/kandel-strategy"

type Props = {
  liquiditySourcing?: string
}

export function useKandelSteps({ liquiditySourcing }: Props) {
  const { address } = useAccount()
  const { markets } = useMarket()
  const { baseToken, quoteToken } = useKandel()
  const client = useClient()
  const kandelSeeder = useKandelSeeder()

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
      kandelSeeder,
      address,
      baseToken?.address,
      quoteToken?.address,
    ],
    queryFn: async () => {
      try {
        if (!baseToken || !quoteToken) return null
        if (
          !kandelSeeder ||
          !address ||
          !publicClient ||
          !addresses ||
          !client ||
          !currentMarket
        )
          throw new Error("Could not fetch kandel steps, missing params")

        const kandelSeederAddress =
          liquiditySourcing === "Aave" ? aaveKandelSeeder : kandelSeeder

        const kandelActions = kandelSeederActions(
          currentMarket,
          kandelSeederAddress,
        )
        const seeder = kandelActions(client)

        const currentSteps = await seeder.getKandelSteps({
          user: address,
        })

        return currentSteps
      } catch (e) {
        console.error(getErrorMessage(e))
        throw new Error("Unable to retrieve kandel steps")
      }
    },
    enabled: !!kandelSeeder && !!address,
    meta: {
      error: "Unable to retrieve kandel steps",
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}
