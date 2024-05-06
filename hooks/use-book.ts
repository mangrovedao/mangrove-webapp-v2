import type { BookParams } from "@mangrovedao/mgv"
import { useQuery } from "@tanstack/react-query"
import { useMarketClient } from "./use-market"
import useMarket from "@/providers/market.new"

export type UseBookParams = BookParams & {}

export function useBook(params?: UseBookParams) {
  const client = useMarketClient()
  const {currentMarket} = useMarket()
  const { data, isLoading, isError } = useQuery({
    queryKey: ["book", params, client, currentMarket?.base, currentMarket?.quote],
    queryFn: async () => {
      console.log("client", client)
      if (!client) return undefined
      return client.getBook(params || {})
    },
    // refetchInterval: 2000,
  })
  return {
    book: data,
    isLoading,
    isError,
  }
}
