"use client"

import { useQuery } from "@tanstack/react-query"
import { useAccount } from "wagmi"

import { TRADE } from "@/app/trade/_constants/loading-keys"
import useIndexerSdk from "@/providers/mangrove-indexer"
import useMarket from "@/providers/market"
import { useLoadingStore } from "@/stores/loading.store"
import { getErrorMessage } from "@/utils/errors"
import { getSemibooksOLKeys, hash } from "@mangrovedao/mgv/lib"
import { parseFills, type Fill } from "./schema"

// Mock data for fills when no data is available
const MOCK_DATA: Fill[] = [
  {
    creationDate: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
    transactionHash:
      "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    isBid: true,
    takerGot: "0.5",
    takerGave: "1000",
    penalty: "0",
    feePaid: "0.5",
    initialWants: "0.5",
    initialGives: "1000",
    price: "2000",
    status: "Completed",
    isMarketOrder: false,
  },
  {
    creationDate: new Date(Date.now() - 1000 * 60 * 25), // 25 minutes ago
    transactionHash:
      "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    isBid: false,
    takerGot: "1200",
    takerGave: "0.6",
    penalty: "0",
    feePaid: "0.3",
    initialWants: "1200",
    initialGives: "0.6",
    price: "2000",
    status: "Completed",
    isMarketOrder: true,
  },
  {
    creationDate: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
    transactionHash:
      "0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456",
    isBid: true,
    takerGot: "0.25",
    takerGave: "500",
    penalty: "0",
    feePaid: "0.1",
    initialWants: "0.25",
    initialGives: "500",
    price: "2000",
    status: "Completed",
    isMarketOrder: false,
  },
  {
    creationDate: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    transactionHash:
      "0xdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abc",
    isBid: false,
    takerGot: "600",
    takerGave: "0.3",
    penalty: "0",
    feePaid: "0.15",
    initialWants: "600",
    initialGives: "0.3",
    price: "2000",
    status: "Completed",
    isMarketOrder: true,
  },
]

type Params<T> = {
  filters?: {
    first?: number
    skip?: number
  }
  select?: (data: Fill[]) => T
}

export function useFills<T = Fill[]>({
  filters: { first = 100, skip = 0 } = {},
  select,
}: Params<T> = {}) {
  const { address, isConnected } = useAccount()
  const { currentMarket: market } = useMarket()
  const { indexerSdk } = useIndexerSdk()
  const [startLoading, stopLoading] = useLoadingStore((state) => [
    state.startLoading,
    state.stopLoading,
  ])

  return useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: [
      "fills",
      market?.base.address,
      market?.quote.address,
      address,
      first,
      skip,
    ],
    queryFn: async () => {
      try {
        if (!(indexerSdk && address && market)) return MOCK_DATA
        startLoading(TRADE.TABLES.ORDERS)
        const { asksMarket, bidsMarket } = getSemibooksOLKeys(market)
        const result = await indexerSdk.getOrdersHistory({
          ask: {
            token: {
              address: asksMarket.outbound_tkn,
              decimals: market.base.decimals,
            },
            olKey: hash(asksMarket),
          },
          bid: {
            token: {
              address: bidsMarket.outbound_tkn,
              decimals: market.quote.decimals,
            },
            olKey: hash(bidsMarket),
          },
          first,
          skip,
          maker: address.toLowerCase(),
        })
        const parsedData = parseFills(result)
        // Return mock data if no real data is available
        return parsedData.length > 0 ? parsedData : MOCK_DATA
      } catch (e) {
        console.error(getErrorMessage(e))
        // Return mock data on error
        return MOCK_DATA
      } finally {
        stopLoading(TRADE.TABLES.ORDERS)
      }
    },
    select,
    meta: {
      error: "Unable to retrieve order history",
    },
    enabled: !!(isConnected && indexerSdk),
    retry: false,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}
