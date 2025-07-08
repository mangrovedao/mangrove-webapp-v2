import { useQueryClient } from "@tanstack/react-query"
import { TransactionReceipt } from "viem"
import { useAccount } from "wagmi"

import { useDefaultChain } from "@/hooks/use-default-chain"
import { useOpenMarkets } from "@/hooks/use-open-markets"
import useMarket from "@/providers/market"
import { getIndexerUrl } from "@/utils/get-indexer-url"
import { z } from "zod"
import { Order } from "../../tables/(shared)/schema"
import { findToken } from "../../tables/(shared)/utils"

type OrderType = "market" | "limit"
type OrderSide = "buy" | "sell"

interface OptimisticOrderData {
  type: OrderType
  side: OrderSide
  receipt: TransactionReceipt | undefined
  parsedResult: {
    takerGot: bigint
    takerGave: bigint
    bounty: bigint
    feePaid: bigint
  }
  form: {
    send: string
    receive: string
    bs: OrderSide
    price?: string
    expiryDate?: Date
  }
}

export function useOptimisticCache() {
  const queryClient = useQueryClient()
  const { address } = useAccount()
  const { currentMarket } = useMarket()
  const { tokens } = useOpenMarkets()
  const { defaultChain } = useDefaultChain()

  const updateQueryCache = (
    queryType: "orders" | "order-history",
    order: Order,
  ) => {
    const queries = queryClient.getQueriesData({ queryKey: [queryType] })

    queries.forEach(([queryKey, oldData]) => {
      const keyArray = queryKey as any[]
      // Match our current market and user context
      if (
        keyArray[1] === false && // allMarkets
        keyArray[2] === address &&
        keyArray[4] === defaultChain.id &&
        keyArray[6] === currentMarket?.base.address &&
        keyArray[7] === currentMarket?.quote.address
      ) {
        queryClient.setQueryData(keyArray, (data: any) => {
          if (!data) {
            return {
              pages: [
                {
                  data: [order],
                  meta: { count: 1, hasNextPage: false, page: 0 },
                },
              ],
            }
          }

          const newData = { ...data }
          newData.pages = [...data.pages]
          newData.pages[0] = {
            ...newData.pages[0],
            data: [order, ...newData.pages[0].data],
            meta: {
              ...newData.pages[0].meta,
              count: newData.pages[0].meta.count + 1,
            },
          }
          return newData
        })
      }
    })
  }

  const addOptimisticOrder = async ({
    type,
    side,
    receipt,
    parsedResult,
    form,
  }: OptimisticOrderData) => {
    if (!address || !currentMarket || !receipt) return

    try {
      const optimisticOrder: Order = {
        creationDate: new Date(),
        transactionHash: `optimistic_${receipt.transactionHash}`,
        feePaid: parsedResult.feePaid.toString(),
        lockedProvision: "0",
        side,
        takerGot: parsedResult.takerGot.toString(),
        takerGave: parsedResult.takerGave.toString(),
        initialWants: form.receive,
        initialGives: form.send,
        price: form.price || "0",
        isMarketOrder: type === "market",
        offerId: "0",
        sendToken:
          findToken(
            side === "buy"
              ? currentMarket.quote.address
              : currentMarket.base.address,
            tokens,
          ) || (side === "buy" ? currentMarket.quote : currentMarket.base),
        receiveToken:
          findToken(
            side === "buy"
              ? currentMarket.base.address
              : currentMarket.quote.address,
            tokens,
          ) || (side === "buy" ? currentMarket.base : currentMarket.quote),
        market: currentMarket,
        status: type === "market" ? "Completed" : "Active",
        expiryDate: form.expiryDate,
        inboundRoute: "",
        outboundRoute: "",
      }

      // Add to active orders only for limit orders
      if (type === "limit") {
        updateQueryCache("orders", optimisticOrder)
      }

      // Add to history for all orders
      updateQueryCache("order-history", optimisticOrder)

      // Schedule indexer sync check
      scheduleIndexerSync(receipt.blockNumber)
    } catch (error) {
      console.error("Failed to add optimistic order:", error)
    }
  }

  const removeOptimisticOrder = (transactionHash: string) => {
    const removeFromQueries = (queryType: "orders" | "order-history") => {
      const queries = queryClient.getQueriesData({ queryKey: [queryType] })

      queries.forEach(([queryKey]) => {
        const keyArray = queryKey as any[]
        if (
          keyArray[1] === false && // allMarkets
          keyArray[2] === address &&
          keyArray[4] === defaultChain.id &&
          keyArray[6] === currentMarket?.base.address &&
          keyArray[7] === currentMarket?.quote.address
        ) {
          queryClient.setQueryData(keyArray, (data: any) => {
            if (!data) return data

            const newData = { ...data }
            newData.pages = data.pages.map((page: any) => ({
              ...page,
              data: page.data.filter(
                (order: Order) =>
                  !order.transactionHash.startsWith(
                    `optimistic_${transactionHash}`,
                  ),
              ),
              meta: { ...page.meta, count: Math.max(0, page.meta.count - 1) },
            }))
            return newData
          })
        }
      })
    }

    removeFromQueries("orders")
    removeFromQueries("order-history")
  }

  const scheduleIndexerSync = (blockNumber: bigint | null) => {
    if (!blockNumber) return

    let attempts = 0
    const maxAttempts = 30

    const checkSync = async () => {
      attempts++
      try {
        const response = await fetch(`${getIndexerUrl()}/status`)
        const data = await response.json()
        const schema = z.object({
          sei: z.object({ block: z.object({ number: z.number() }) }),
        })
        const {
          sei: { block },
        } = schema.parse(data)

        if (BigInt(block.number) >= blockNumber) {
          queryClient.invalidateQueries({ queryKey: ["orders"] })
          queryClient.invalidateQueries({ queryKey: ["order-history"] })
          return
        }

        if (attempts < maxAttempts) {
          setTimeout(checkSync, 10000)
        } else {
          // Force refresh after timeout
          queryClient.invalidateQueries({ queryKey: ["orders"] })
          queryClient.invalidateQueries({ queryKey: ["order-history"] })
        }
      } catch (error) {
        if (attempts < maxAttempts) {
          setTimeout(checkSync, 10000)
        }
      }
    }

    checkSync()
  }

  return {
    addOptimisticOrder,
    removeOptimisticOrder,
  }
}
