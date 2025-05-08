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
import { parseOrders, type Order } from "../schema"

type Params<T> = {
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

export function useOrders<T = Order[]>({
  pageSize = 25,
  allMarkets = false,
}: Params<T> = {}) {
  const { address } = useAccount()
  const { currentMarket: market } = useMarket()
  const { openMarkets } = useOpenMarkets()
  const { defaultChain } = useDefaultChain()
  const [startLoading, stopLoading] = useLoadingStore((state) => [
    state.startLoading,
    state.stopLoading,
  ])

  return useInfiniteQuery<OrdersPage>({
    queryKey: [
      "orders",
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
            meta: { hasNextPage: false, count: 0, page: pageParam as number },
          }

        startLoading(TRADE.TABLES.ORDERS)

        const marketMap: Record<string, string> = {}

        openMarkets.forEach(({ base, quote }) => {
          marketMap[`${base.address}.${quote.address}`] =
            `${base.symbol}.${quote.symbol}`
        })

        const orderPromise = async () => {
          try {
            const response = await fetch(
              `${getIndexerUrl(defaultChain)}/orders/all/active/${defaultChain.id}?user=${address}&page=${pageParam}&limit=${pageSize}`,
            )

            const data = await response.json()

            // Add market information to each order
            return {
              ...data,
              orders: data.orders.map((order: any) => {
                const { sendToken, receiveToken } = order

                if (!sendToken || !receiveToken) return

                const pairs = Object.keys(marketMap)

                console.log(pairs, `${sendToken}.${receiveToken}`)

                const side = pairs.includes(`${sendToken}.${receiveToken}`)
                  ? "buy"
                  : "sell"

                const isBuy = side === "buy"

                const symbols = isBuy
                  ? marketMap[`${sendToken}.${receiveToken}`]!.split(".")
                  : marketMap[`${receiveToken}.${sendToken}`]!.split(".")

                const [marketBase, marketQuote] = symbols

                const baseAddress = isBuy ? sendToken : receiveToken
                const quoteAddress = isBuy ? receiveToken : sendToken

                const price = 1 / order.price

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

        const transformedData = data?.orders?.map((item: any) => {
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
            expiryDate: item.expiry ? safeDate(item.expiry) : undefined,
            transactionHash: item.transactionHash || "",
            isBid: item.side === "buy",
            takerGot: item.total?.toString() || "0",
            takerGave: item.sent?.toString() || "0",
            penalty: "0", // Default value as it's not in the raw data
            feePaid: item.fee?.toString() || "0",
            initialWants: item.totalWants?.toString() || "0",
            initialGives: item.totalGives?.toString() || "0",
            price: item.price?.toString() || "0",
            offerId: item.offerId?.toString() || "0",
            inboundRoute: item.inboundRoute || "",
            outboundRoute: item.outboundRoute || "",
            marketBase: item.marketBase,
            marketQuote: item.marketQuote,
            baseAddress: item.baseAddress,
            quoteAddress: item.quoteAddress,
          }
        })

        const parsedData = parseOrders(transformedData || [])

        // Sort by timestamp descending (newest first)
        parsedData.sort(
          (a, b) =>
            new Date(b.creationDate).getTime() -
            new Date(a.creationDate).getTime(),
        )

        return {
          data: parsedData,
          meta: {
            count: parsedData.length,
            hasNextPage: parsedData.length >= pageSize,
            page: pageParam as number,
          },
        }
      } catch (e) {
        console.error(getErrorMessage(e))
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
      error: "Unable to retrieve open orders",
    },
    enabled: !!market,
    refetchInterval: 5 * 1000, // 10 seconds
  })
}
