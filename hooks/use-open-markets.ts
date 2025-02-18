import { printEvmError } from "@/utils/errors"
import { getOpenMarkets } from "@mangrovedao/mgv/actions"
import { useQuery } from "@tanstack/react-query"
import { useAccount } from "wagmi"
import { useCashnesses, useMangroveAddresses } from "./use-addresses"
import { useNetworkClient } from "./use-network-client"

export function useOpenMarkets() {
  const client = useNetworkClient()
  const addresses = useMangroveAddresses()
  const cashnesses = useCashnesses()
  const { chain } = useAccount()

  const { data, isLoading, isError } = useQuery({
    queryKey: ["open-markets", client?.key, cashnesses, addresses, chain?.id],
    queryFn: async () => {
      try {
        if (!client) throw new Error("No market client found")

        return await getOpenMarkets(client, addresses, {
          cashnesses,
        })
      } catch (error) {
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
