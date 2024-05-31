import { useMarketClient } from "@/hooks/use-market"
import useMarket from "@/providers/market.new"
import { getErrorMessage } from "@/utils/errors"
import { kandelSeederActions } from "@mangrovedao/mgv"
import { blastSmartKandel } from "@mangrovedao/mgv/addresses"
import { useQuery } from "@tanstack/react-query"
import { Chain, Client, Transport } from "viem"

export function useKandelSeeder() {
  const { currentMarket } = useMarket()
  const client = useMarketClient()

  return useQuery({
    queryKey: ["kandel-seeder", currentMarket],
    queryFn: async () => {
      try {
        if (!currentMarket || !client) return
        const kandelSeeder = kandelSeederActions(
          currentMarket,
          blastSmartKandel,
        )
        const seeder = kandelSeeder(
          client as Client<Transport, Chain, undefined, any, any>,
        )
        console.log("seeder", seeder)
        return seeder
      } catch (e) {
        console.error(getErrorMessage(e))
        throw new Error("Unable to retrieve kandel seeder")
      }
    },
    enabled: !!currentMarket,
    meta: {
      error: "Unable to retrieve kandel seeder",
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}
