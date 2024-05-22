import { useQuery } from "@tanstack/react-query"
import { getErrorMessage } from "@/utils/errors"
import { useMarketClient } from "@/hooks/use-market"
import useMarket from "@/providers/market.new"
import { kandelSeederActions } from "@mangrovedao/mgv"
import { blastSmartKandel } from "@mangrovedao/mgv/addresses"

export function useKandelSeeder() {
    const {currentMarket} = useMarket()
    const client = useMarketClient()

    return useQuery({
    queryKey: ["kandelSeeder", currentMarket],
    queryFn: async () => {
        try {
        if (!currentMarket || !client) return
        const  kandelSeeder = kandelSeederActions(currentMarket, blastSmartKandel)
        const seeder = kandelSeeder(client) 
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


