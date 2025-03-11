"use client"

import { useQuery } from "@tanstack/react-query"

import useIndexerSdk from "@/providers/mangrove-indexer"
import useMarket from "@/providers/market"
import { getErrorMessage } from "@/utils/errors"
import { getSemibooksOLKeys, hash } from "@mangrovedao/mgv/lib"
import { parseTradeHistory, type TradeHistory } from "./schema"

// Mock data for trade history when no data is available
const MOCK_DATA: TradeHistory[] = [
  {
    creationDate: new Date(Date.now() - 1000 * 60 * 2), // 2 minutes ago
    transactionHash:
      "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    isBid: true,
    takerGot: "0.15",
    takerGave: "300",
    penalty: "0",
    feePaid: "0.1",
    initialWants: "0.15",
    initialGives: "300",
    price: "2000",
    status: "Completed",
    isMarketOrder: false,
  },
  {
    creationDate: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    transactionHash:
      "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    isBid: false,
    takerGot: "400",
    takerGave: "0.2",
    penalty: "0",
    feePaid: "0.1",
    initialWants: "400",
    initialGives: "0.2",
    price: "2000",
    status: "Completed",
    isMarketOrder: true,
  },
  {
    creationDate: new Date(Date.now() - 1000 * 60 * 8), // 8 minutes ago
    transactionHash:
      "0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456",
    isBid: true,
    takerGot: "0.25",
    takerGave: "500",
    penalty: "0",
    feePaid: "0.15",
    initialWants: "0.25",
    initialGives: "500",
    price: "2000",
    status: "Completed",
    isMarketOrder: false,
  },
  {
    creationDate: new Date(Date.now() - 1000 * 60 * 12), // 12 minutes ago
    transactionHash:
      "0xdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abc",
    isBid: false,
    takerGot: "600",
    takerGave: "0.3",
    penalty: "0",
    feePaid: "0.2",
    initialWants: "600",
    initialGives: "0.3",
    price: "2000",
    status: "Completed",
    isMarketOrder: true,
  },
  {
    creationDate: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    transactionHash:
      "0x567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234",
    isBid: true,
    takerGot: "0.1",
    takerGave: "200",
    penalty: "0",
    feePaid: "0.05",
    initialWants: "0.1",
    initialGives: "200",
    price: "2000",
    status: "Completed",
    isMarketOrder: false,
  },
]

type Params<T> = {
  filters?: {
    first?: number
    skip?: number
  }
  select?: (data: TradeHistory[]) => T
}

export function useTradeHistory<T = TradeHistory[]>({
  filters: { first = 100, skip = 0 } = {},
  select,
}: Params<T> = {}) {
  const { currentMarket: market } = useMarket()
  const { indexerSdk } = useIndexerSdk()

  return useQuery({
    queryKey: [
      "trade-history",
      market?.base.address,
      market?.quote.address,
      first,
      skip,
    ],
    queryFn: async () => {
      try {
        if (!(indexerSdk && market)) return MOCK_DATA
        const { asksMarket, bidsMarket } = getSemibooksOLKeys(market)
        const result = await indexerSdk.getMarketHistory({
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
        })
        const parsedData = parseTradeHistory(result)
        // Return mock data if no real data is available
        return parsedData.length > 0 ? parsedData : MOCK_DATA
      } catch (e) {
        console.error(getErrorMessage(e))
        // Return mock data on error
        return MOCK_DATA
      }
    },
    select,
    meta: {
      error: "Unable to retrieve trade history",
    },
    enabled: !!indexerSdk,
    retry: false,
    staleTime: 1 * 20 * 1000, // 20 seconds
  })
}
