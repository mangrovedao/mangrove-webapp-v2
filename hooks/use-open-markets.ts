import { printEvmError } from "@/utils/errors"
import { getOpenMarkets } from "@mangrovedao/mgv/actions"
import { useQuery } from "@tanstack/react-query"
import { usePublicClient } from "wagmi"
import { useCashnesses, useMangroveAddresses } from "./use-addresses"

export function useOpenMarkets() {
  const client = usePublicClient()
  const addresses = useMangroveAddresses()
  const cashnesses = useCashnesses()

  const { data, isLoading, isError } = useQuery({
    queryKey: ["open-markets"],
    queryFn: async () => {
      try {
        if (!client) {
          throw new Error("No market client found")
        }

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
    refetchInterval: 3000,
  })

  return {
    openMarkets: data,
    isLoading,
    isError,
  }
}
