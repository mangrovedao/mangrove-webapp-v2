import { printEvmError } from "@/utils/errors"
import { getOpenMarkets } from "@mangrovedao/mgv/actions"
import { useQuery } from "@tanstack/react-query"
import { useCashnesses, useMangroveAddresses } from "./use-addresses"
import { useNetworkClient } from "./use-network-client"

export function useOpenMarkets() {
  const client = useNetworkClient()

  const addresses = useMangroveAddresses()
  const cashnesses = useCashnesses()

  const { data, isLoading, isError } = useQuery({
    queryKey: ["open-markets"],
    queryFn: async () => {
      try {
        if (!client) throw new Error("No market client found")
        console.log(client, addresses, cashnesses)
        return await getOpenMarkets(client, addresses, {
          cashnesses,
        })
      } catch (error) {
        console.error("error", error)
        printEvmError(error)
        return []
      }
    },
    enabled: !!(client?.key && cashnesses && addresses),
    retry: true,
  })

  return {
    openMarkets: data,
    isLoading,
    isError,
  }
}
