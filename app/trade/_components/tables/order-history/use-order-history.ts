"use client"

import { useInfiniteQuery } from "@tanstack/react-query"
import { useAccount } from "wagmi"

import { TRADE } from "@/app/trade/_constants/loading-keys"
import { useDefaultChain } from "@/hooks/use-default-chain"
import { useOpenMarkets } from "@/hooks/use-open-markets"
import useMarket from "@/providers/market"
import { useLoadingStore } from "@/stores/loading.store"
import { getErrorMessage } from "@/utils/errors"
import { getIndexerUrl } from "@/utils/get-indexer-url"
import { parseOrderHistory, type OrderHistory } from "./schema"

type Params = {
  pageSize?: number
  allMarkets?: boolean
}

// Define the response type
type OrderHistoryPage = {
  data: OrderHistory[]
  meta: {
    hasNextPage: boolean
    page: number
    totalItems: number
  }
}

export function useOrderHistory({
  pageSize = 25,
  allMarkets = false,
}: Params = {}) {
  const { defaultChain } = useDefaultChain()
  const { address } = useAccount()
  const { currentMarket: market } = useMarket()
  const { openMarkets } = useOpenMarkets()
  const [startLoading, stopLoading] = useLoadingStore((state) => [
    state.startLoading,
    state.stopLoading,
  ])

  return useInfiniteQuery<OrderHistoryPage>({
    queryKey: [
      "order-history",
      allMarkets ? "all-markets" : market?.base.address,
      allMarkets ? "" : market?.quote.address,
      address,
      pageSize,
      defaultChain.id,
    ],
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      try {
        if (
          !address ||
          (!allMarkets && !market) ||
          (allMarkets && (!openMarkets || openMarkets.length === 0))
        )
          return {
            data: [],
            meta: {
              hasNextPage: false,
              page: pageParam as number,
              totalItems: 0,
            },
          }

        startLoading(TRADE.TABLES.ORDERS)

        const marketMap: Record<string, string> = {}

        openMarkets.forEach(({ base, quote }) => {
          marketMap[`${base.address}.${quote.address}`] =
            `${base.symbol}.${quote.symbol}`
        })

        // Fetch order history for all specified markets
        const orderPromise = async () => {
          try {
            const response = await fetch(
              `${getIndexerUrl(defaultChain)}/orders/all/history/${defaultChain.id}?user=${address}&page=${pageParam}&limit=${pageSize}`,
            )

            const data = await response.json()

            // Add market information to each order
            return {
              ...data,
              orders: data.orders.map((order: any) => {
                if (!order.sendToken || !order.receiveToken) return
                const side = Object.keys(marketMap).includes(
                  `${order.sendToken}.${order.receiveToken}`,
                )
                  ? "buy"
                  : "sell"

                const symbols =
                  side === "buy"
                    ? marketMap[
                        `${order.sendToken}.${order.receiveToken}`
                      ]!.split(".")
                    : marketMap[
                        `${order.receiveToken}.${order.sendToken}`
                      ]!.split(".")

                const [marketBase, marketQuote] = symbols

                const baseAddress =
                  side === "buy" ? order.sendToken : order.receiveToken
                const quoteAddress =
                  side === "buy" ? order.receiveToken : order.sendToken

                const price =
                  side === "buy"
                    ? order.received / order.sent
                    : order.sent / order.received

                return {
                  ...order,
                  marketBase,
                  marketQuote,
                  side,
                  price,
                  baseAddress,
                  quoteAddress,
                }
              }),
            }
          } catch (error) {
            return { orders: [] }
          }
        }

        const data = await orderPromise()

        // Transform the raw data to match our schema format
        const transformedData = data?.orders?.map((item: any) => ({
          creationDate: new Date(item.timestamp * 1000),
          transactionHash: item.transactionHash,
          isBid: item.side === "buy",
          takerGot: item.received?.toString() || "0",
          takerGave: item.sent?.toString() || "0",
          penalty: "0", // Default value as it's not in the raw data
          feePaid: item.fee?.toString() || "0",
          initialWants: "0", // Default value as it's not in the raw data
          initialGives: "0", // Default value as it's not in the raw data
          price: item.price?.toString() || "0",
          status: item.status || "",
          isMarketOrder: item.type !== "GTC", // Assuming non-GTC orders are market orders
          marketBase: item.marketBase,
          marketQuote: item.marketQuote,
          baseAddress: item.baseAddress,
          quoteAddress: item.quoteAddress,
        }))

        // Sort by timestamp descending (newest first)
        transformedData.sort(
          (a: any, b: any) =>
            new Date(b.creationDate).getTime() -
            new Date(a.creationDate).getTime(),
        )

        const parsedData = parseOrderHistory(transformedData)

        return {
          data: parsedData,
          count: data.count,
          meta: {
            hasNextPage: parsedData.length >= pageSize,
            page: pageParam as number,
            totalItems: data.count,
          },
        }
      } catch (e) {
        console.error(getErrorMessage(e))
        return {
          data: [],
          meta: {
            hasNextPage: false,
            page: pageParam as number,
            totalItems: 0,
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
      error: "Unable to retrieve order history",
    },
    enabled: !!market,
    refetchInterval: 5 * 1000, // 5 seconds
  })
}
