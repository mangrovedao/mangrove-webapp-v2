import { printEvmError } from "@/utils/errors"

import { getOpenMarkets } from "@mangrovedao/mgv/actions"
import { useQuery } from "@tanstack/react-query"
import {
  useCashnesses,
  useMangroveAddresses,
  useSymbolOverrides,
} from "./use-addresses"
import { useNetworkClient } from "./use-network-client"
export function useOpenMarkets() {
  const client = useNetworkClient()
  const networkClient = useNetworkClient()
  const addresses = useMangroveAddresses()
  const cashnesses = useCashnesses()
  const symbolOverride = useSymbolOverrides()

  const clientToUse = client.account ? client : networkClient

  const { data, isLoading, isError } = useQuery({
    queryKey: [
      "open-markets",
      client?.key,
      cashnesses,
      addresses,
      clientToUse?.chain?.id,
      networkClient?.key,
    ],
    queryFn: async () => {
      try {
        if (!clientToUse || !networkClient)
          throw new Error("No market client found")

        return await getOpenMarkets(clientToUse, addresses, {
          cashnesses: Object.fromEntries(
            Object.entries(cashnesses).filter(Boolean),
          ),
          symbolOverrides: Object.fromEntries(
            Object.entries(symbolOverride).filter(Boolean),
          ),
        })
      } catch (error) {
        console.error("Error fetching open markets:", error)
        printEvmError(error)
        return []
      }
    },
    enabled: !!(client?.key && cashnesses && addresses),
    retry: true,
    staleTime: 1000 * 30, // 30 seconds
  })

  return {
    openMarkets: data,
    isLoading,
    isError,
  }
}
