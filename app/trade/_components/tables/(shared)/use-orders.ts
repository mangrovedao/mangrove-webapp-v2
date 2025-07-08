"use client"

import { useInfiniteQuery } from "@tanstack/react-query"
import { useAccount } from "wagmi"

import { TRADE } from "@/app/trade/_constants/loading-keys"
import { useDefaultChain } from "@/hooks/use-default-chain"
import { useOpenMarkets } from "@/hooks/use-open-markets"
import useMarket from "@/providers/market"
import { useLoadingStore } from "@/stores/loading.store"
import { useIndexerUrl } from "@/utils/get-indexer-url"
import { parseOrders, type Order } from "../(shared)/schema"
import { findToken, safeDate, transformOrders } from "../(shared)/utils"

type Params<T> = {
  type: "active" | "history"
  pageSize?: number
  allMarkets?: boolean
  select?: (data: Order[]) => T
}

// Define the response type
type OrdersPage = {
  data: Order[]
  meta: {
    count: number
    hasNextPage: boolean
    page: number
  }
}

export function useOrders<T = Order[]>(
  { type, pageSize = 25, allMarkets = false }: Params<T> = { type: "active" },
) {
  const { address } = useAccount()
  const { currentMarket: market } = useMarket()
  const { openMarkets, tokens } = useOpenMarkets()
  const { defaultChain } = useDefaultChain()
  const startLoading = useLoadingStore((state) => state.startLoading)
  const stopLoading = useLoadingStore((state) => state.stopLoading)

  const indexerUrl = useIndexerUrl()
  const config = {
    active: {
      queryKey: "orders",
      apiRoute: `${indexerUrl}/orders/all/active/${defaultChain.id}`,
    },
    history: {
      queryKey: "order-history",
      apiRoute: `${indexerUrl}/orders/all/history/${defaultChain.id}`,
    },
  }

  return useInfiniteQuery<OrdersPage>({
    queryKey: [
      config[type].queryKey,
      allMarkets,
      address,
      pageSize,
      defaultChain.id,
      openMarkets?.length,
      market?.base.address,
      market?.quote.address,
    ],
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      try {
        if (
          !address ||
          (allMarkets && !market) ||
          (allMarkets && (!openMarkets || openMarkets.length === 0))
        ) {
          return {
            data: [],
            meta: { hasNextPage: false, count: 0, page: pageParam as number },
          }
        }

        startLoading(TRADE.TABLES.ORDERS)

        const getOrders: () => Promise<{
          orders: Order[]
          count: number
        }> = async () => {
          try {
            const response = await fetch(
              `${config[type].apiRoute}?user=${address}&page=${pageParam}&limit=${pageSize}`,
            )

            if (!response.ok) {
              return { orders: [] }
            }

            const data = await response.json()

            // Apply pricing and trade side to the data
            data.orders = transformOrders(data.orders, openMarkets)

            // Add market information to each order
            return {
              ...data,
              orders: data.orders?.map((order: any) => ({
                ...order,
                sendToken: findToken(order.sendToken, tokens),
                receiveToken: findToken(order.receiveToken, tokens),
              })),
            }
          } catch (error) {
            console.error(
              `Error fetching for market ${market?.base.symbol}-${market?.quote.symbol}:`,
              error,
            )
            return { orders: [] }
          }
        }

        const data = await getOrders()

        const transformedData = data?.orders.map((item: any) => {
          return {
            creationDate: safeDate(item.timestamp),
            lockedProvision: item.lockedProvision?.toString() || "0",
            transactionHash: item.transactionHash || "",
            side: item.side || "",
            offerId: item.offerId?.toString() || "0",
            takerGot: item.received?.toString() || "0",
            takerGave: item.sent?.toString() || "0",
            feePaid: item.fee?.toString() || "0", // No fees for limit orders
            initialWants: item.totalWants?.toString() || "",
            initialGives: item.totalGives?.toString() || "",
            price: item.price?.toString() || "0",
            status: item?.price === 0 ? "Canceled" : item.status || "",
            isMarketOrder: item.type.toLowerCase() === "market",
            market: item.market,
            sendToken: item.sendToken,
            receiveToken: item.receiveToken,

            // --- Limit only fields below
            inboundRoute: item.inboundRoute || "", // might be used in future
            outboundRoute: item.outboundRoute || "", // might be used in future
            expiryDate: item.expiry ? safeDate(item.expiry) : undefined,
          }
        })

        const parsedData = parseOrders(transformedData)

        const filteredOrders = parsedData
          .filter((order) => {
            if (allMarkets) {
              return true
            }

            return (
              order.market.base.address.toLowerCase() ===
                market?.base.address.toLowerCase() &&
              order.market.quote.address.toLowerCase() ===
                market?.quote.address.toLowerCase()
            )
          })
          .filter((order, index, self) => {
            return (
              index ===
              self.findIndex(
                (o) =>
                  o.offerId === order.offerId &&
                  o.transactionHash === order.transactionHash,
              )
            )
          })

        // Sort by timestamp descending (newest first)
        filteredOrders.sort(
          (a, b) =>
            new Date(b.creationDate).getTime() -
            new Date(a.creationDate).getTime(),
        )

        return {
          data: filteredOrders,
          meta: {
            count: data.count,
            hasNextPage: filteredOrders.length >= pageSize,
            page: pageParam as number,
          },
        }
      } catch (e) {
        console.error(e)
        return {
          data: [],
          meta: {
            count: 0,
            hasNextPage: false,
            page: pageParam as number,
          },
        }
      } finally {
        stopLoading(TRADE.TABLES.ORDERS)
      }
    },
    getNextPageParam: (lastPage) => {
      // If we got fewer orders than the requested page size, there are no more pages
      if (!lastPage.meta.hasNextPage) return undefined
      return lastPage.meta.page + 1
    },
    meta: {
      error: `Unable to retrieve ${type} orders`,
    },
    enabled: !!market && !!address,
    refetchInterval: 5 * 1000, // 10 seconds
  })
}
