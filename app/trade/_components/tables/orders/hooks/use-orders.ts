"use client"

import { useQuery } from "@tanstack/react-query"
import { useAccount } from "wagmi"

import { TRADE } from "@/app/trade/_constants/loading-keys"
import { useDefaultChain } from "@/hooks/use-default-chain"
import useMarket from "@/providers/market"
import { useLoadingStore } from "@/stores/loading.store"
import { getErrorMessage } from "@/utils/errors"
import { parseOrders, type Order } from "../schema"

type Params<T> = {
  filters?: {
    first?: number
    skip?: number
  }
  select?: (data: Order[]) => T
}

export function useOrders<T = Order[]>({
  filters: { first = 100, skip = 0 } = {},
  select,
}: Params<T> = {}) {
  const { address, isConnected } = useAccount()
  const { currentMarket: market } = useMarket()
  const { defaultChain } = useDefaultChain()
  const [startLoading, stopLoading] = useLoadingStore((state) => [
    state.startLoading,
    state.stopLoading,
  ])

  return useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: [
      "orders",
      market?.base.address,
      market?.quote.address,
      address,
      first,
      skip,
    ],
    queryFn: async () => {
      try {
        if (!(address && market)) return []
        startLoading(TRADE.TABLES.ORDERS)

        const activeOrders = await fetch(
          `https://indexer.mgvinfra.com/orders/active/${defaultChain.id}/${market.base.address}/${market.quote.address}/${market.tickSpacing}?user=${address}&page=${0}&limit=${first}`,
        ).then(async (res) => await res.json())

        const transformedData = activeOrders.orders?.map((item: any) => {
          // Safe date parsing function that handles invalid or missing timestamps
          const safeDate = (timestamp: number | undefined | null) => {
            // Check if timestamp is valid number and reasonable (after 2010)
            if (
              timestamp &&
              typeof timestamp === "number" &&
              timestamp > 1262304000
            ) {
              try {
                const date = new Date(timestamp * 1000)
                // Verify the date is valid
                if (!isNaN(date.getTime())) {
                  return date
                }
              } catch (e) {
                console.warn("Invalid date parsing", timestamp, e)
              }
            }
            // Return current date as fallback for required date fields
            return new Date()
          }

          return {
            creationDate: safeDate(item.timestamp),
            latestUpdateDate: safeDate(item.timestamp), // Using same timestamp for latest update
            expiryDate: item.expiryDate ? safeDate(item.expiryDate) : undefined,
            transactionHash: item.transactionHash || "",
            isBid: item.side === "buy",
            takerGot: item.received?.toString() || "0",
            takerGave: item.sent?.toString() || "0",
            penalty: "0", // Default value as it's not in the raw data
            feePaid: item.fee?.toString() || "0",
            initialWants: item.initialWants?.toString() || "0",
            initialGives: item.initialGives?.toString() || "0",
            price: item.price?.toString() || "0",
            offerId: item.offerId?.toString() || "0",
            inboundRoute: item.inboundRoute || "",
            outboundRoute: item.outboundRoute || "",
          }
        })

        console.log("active orders", { transformedData })

        const parsedData = parseOrders(transformedData || [])
        return parsedData
      } catch (e) {
        console.error(getErrorMessage(e))
        return []
      } finally {
        stopLoading(TRADE.TABLES.ORDERS)
      }
    },
    select,
    meta: {
      error: "Unable to retrieve open orders",
    },
    enabled: !!isConnected,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
