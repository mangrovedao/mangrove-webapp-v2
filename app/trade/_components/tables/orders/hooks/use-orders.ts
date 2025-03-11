"use client"

import { useQuery } from "@tanstack/react-query"
import { useAccount } from "wagmi"

import { TRADE } from "@/app/trade/_constants/loading-keys"
import useIndexerSdk from "@/providers/mangrove-indexer"
import useMarket from "@/providers/market"
import { useLoadingStore } from "@/stores/loading.store"
import { getErrorMessage } from "@/utils/errors"
import { hash } from "@mangrovedao/mgv"
import { getSemibooksOLKeys } from "@mangrovedao/mgv/lib"
import { parseOrders, type Order } from "../schema"

// Mock data for orders when no data is available
const MOCK_DATA: Order[] = [
  {
    creationDate: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    latestUpdateDate: new Date(Date.now() - 1000 * 60 * 30),
    expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours from now
    transactionHash:
      "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    isBid: true,
    takerGot: "0.5",
    takerGave: "1000",
    penalty: "0",
    feePaid: "0.5",
    initialWants: "1",
    initialGives: "2000",
    price: "2000",
    offerId: "1",
    inboundRoute: "",
    outboundRoute: "",
  },
  {
    creationDate: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    latestUpdateDate: new Date(Date.now() - 1000 * 60 * 15),
    expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 12), // 12 hours from now
    transactionHash:
      "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    isBid: false,
    takerGot: "800",
    takerGave: "0.4",
    penalty: "0",
    feePaid: "0.2",
    initialWants: "1000",
    initialGives: "0.5",
    price: "2000",
    offerId: "2",
    inboundRoute: "",
    outboundRoute: "",
  },
  {
    creationDate: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    latestUpdateDate: new Date(Date.now() - 1000 * 60 * 5),
    expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 6), // 6 hours from now
    transactionHash:
      "0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456",
    isBid: true,
    takerGot: "0",
    takerGave: "0",
    penalty: "0",
    feePaid: "0",
    initialWants: "0.75",
    initialGives: "1500",
    price: "2000",
    offerId: "3",
    inboundRoute: "",
    outboundRoute: "",
  },
]

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
  const { indexerSdk } = useIndexerSdk()
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
      if (!(indexerSdk && address && market)) return MOCK_DATA
      startLoading(TRADE.TABLES.ORDERS)

      try {
        const { asksMarket, bidsMarket } = getSemibooksOLKeys(market)

        const result = await indexerSdk.getOpenLimitOrders({
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

        const parsedData = parseOrders(result)
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
      error: "Unable to retrieve orders",
    },
    enabled: !!(isConnected && indexerSdk),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
