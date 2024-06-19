import type { BookParams } from "@mangrovedao/mgv"
import { useQuery } from "@tanstack/react-query"
import { useKandelClient } from "./use-kandel-client"

export type UseBookParams = BookParams & {}

export function useKandelBook(params?: UseBookParams) {
  const kandelClient = useKandelClient()
  const { data, isLoading, isError } = useQuery({
    queryKey: ["book-kandel", params, kandelClient?.chain.id],
    queryFn: async () => {
      try {
        if (!kandelClient) return null
        return kandelClient.getBook(params || {})
      } catch (error) {
        console.error(error)
      }
    },
    enabled: !!kandelClient,
    refetchInterval: 3000,
  })
  return {
    book: data,
    isLoading,
    isError,
  }
}
