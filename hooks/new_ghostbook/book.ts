import { CompleteOffer, MarketParams, tickFromVolumes } from "@mangrovedao/mgv"
import { BA, rpcOfferToHumanOffer } from "@mangrovedao/mgv/lib"
import { useQuery } from "@tanstack/react-query"
import { PublicClient } from "viem"

import useMarket from "@/providers/market"
import { getBook } from "@mangrovedao/mgv/actions"
import { useMangroveAddresses } from "../use-addresses"
import { useDefaultChain } from "../use-default-chain"
import { useNetworkClient } from "../use-network-client"
import { slipstreamQuoterAbi, uniQuoterABI } from "./abi/quoter"
import { Pool, ProtocolType, usePool } from "./pool"

export function useMangroveBook() {
  const mangrove = useMangroveAddresses()
  const { defaultChain } = useDefaultChain()
  const { currentMarket: market } = useMarket()
  const client = useNetworkClient()

  return useQuery({
    queryKey: [
      "mangrove-book",
      defaultChain?.id,
      market?.base.address.toString(),
      market?.quote.address.toString(),
      mangrove?.mgv,
      client?.key,
    ],
    queryFn: async () => {
      if (!market || !mangrove || !client) return null
      return getBook(client, mangrove, market)
    },
    refetchInterval: 2000,
  })
}

async function getPoolBook(
  client: PublicClient,
  market: MarketParams,
  quoteInAmount: bigint,
  baseInAmount: bigint,
  depth: number,
  pool: Pool,
): Promise<{
  asks: CompleteOffer[]
  bids: CompleteOffer[]
}> {
  if (quoteInAmount === 0n || baseInAmount === 0n) {
    return { asks: [], bids: [] }
  }
  const nOffers = depth

  // Create arrays of random amounts distributed around quoteInAmount and baseInAmount
  const quoteAmountsIn = Array.from({ length: nOffers }, (_, i) => {
    // Generate a random factor between 0.8 and 1.2 to create variation
    const randomFactor = 0.8 + Math.random() * 0.4
    // Apply the random factor to the base amount
    return BigInt(Math.floor(Number(quoteInAmount) * randomFactor))
  }).reduce((acc, current, index) => {
    // Add current amount to previous cumulative sum
    acc[index] = index === 0 ? current : acc[index - 1] + current
    return acc
  }, new Array(nOffers).fill(0n))

  const baseAmountsIn = Array.from({ length: nOffers }, (_, i) => {
    // Generate a random factor between 0.8 and 1.2 to create variation
    const randomFactor = 0.8 + Math.random() * 0.4
    // Apply the random factor to the base amount
    return BigInt(Math.floor(Number(baseInAmount) * randomFactor))
  }).reduce((acc, current, index) => {
    // Add current amount to previous cumulative sum
    acc[index] = index === 0 ? current : acc[index - 1] + current
    return acc
  }, new Array(nOffers).fill(0n))

  const quotes = await client.multicall({
    contracts: [
      // Asks quotes (WETH -> USDC)
      ...quoteAmountsIn.map(
        (amountIn) =>
          ({
            address: pool.protocol.quoter,
            abi:
              pool.protocol.type === ProtocolType.Slipstream
                ? slipstreamQuoterAbi
                : uniQuoterABI,
            functionName: "quoteExactInputSingle",
            args: [
              {
                tokenIn: market.quote.address,
                tokenOut: market.base.address,
                amountIn,
                fee: "fee" in pool ? pool.fee : undefined,
                tickSpacing:
                  "tickSpacing" in pool ? pool.tickSpacing : undefined,
                sqrtPriceLimitX96: 0n,
              },
            ],
          }) as const,
      ),
      // Bids quotes (USDC -> WETH)
      ...baseAmountsIn.map(
        (amountIn) =>
          ({
            address: pool.protocol.quoter,
            abi:
              pool.protocol.type === ProtocolType.Slipstream
                ? slipstreamQuoterAbi
                : uniQuoterABI,
            functionName: "quoteExactInputSingle",
            args: [
              {
                tokenIn: market.base.address,
                tokenOut: market.quote.address,
                amountIn,
                fee: "fee" in pool ? pool.fee : undefined,
                tickSpacing:
                  "tickSpacing" in pool ? pool.tickSpacing : undefined,
                sqrtPriceLimitX96: 0n,
              },
            ],
          }) as const,
      ),
    ],
    batchSize: 5096,
    allowFailure: false,
  })

  let previousAsksAmountOut = 0n
  let previousAsksGasEstimate = 0n
  const asks: CompleteOffer[] = []
  for (let i = 0; i < nOffers; i++) {
    const [amountOutRaw, , , gasEstimateRaw] = quotes[i] as [
      bigint,
      bigint,
      number,
      bigint,
    ]
    const amountIn =
      i === 0 ? quoteAmountsIn[i] : quoteAmountsIn[i] - quoteAmountsIn[i - 1]
    const amountOut = amountOutRaw - previousAsksAmountOut
    previousAsksAmountOut = amountOutRaw
    const gasEstimate = gasEstimateRaw - previousAsksGasEstimate
    previousAsksGasEstimate = gasEstimateRaw
    const tick = tickFromVolumes(amountIn, amountOut, 1n)

    const gives = amountOut

    const offer = rpcOfferToHumanOffer({
      gives,
      tick,
      ba: BA.asks,
      baseDecimals: market.base.decimals,
      quoteDecimals: market.quote.decimals,
    })
    asks.push({
      id: 0n,
      offer: { prev: 0n, next: 0n, tick, gives },
      detail: {
        maker: pool.pool,
        gasreq: gasEstimate,
        kilo_offer_gasbase: 0n,
        gasprice: 0n,
      },
      ...offer,
    })
  }

  let previousBidsAmountOut = 0n
  let previousBidsGasEstimate = 0n
  const bids: CompleteOffer[] = []
  for (let i = nOffers; i < 2 * nOffers; i++) {
    const [amountOutRaw, , , gasEstimateRaw] = quotes[i] as [
      bigint,
      bigint,
      number,
      bigint,
    ]
    const amountIn =
      i === nOffers
        ? baseAmountsIn[i - nOffers]
        : baseAmountsIn[i - nOffers] - baseAmountsIn[i - nOffers - 1]
    const amountOut = amountOutRaw - previousBidsAmountOut
    previousBidsAmountOut = amountOutRaw
    const gasEstimate = gasEstimateRaw - previousBidsGasEstimate
    previousBidsGasEstimate = gasEstimateRaw
    const tick = tickFromVolumes(amountIn, amountOut, 1n)

    const gives = amountOut
    const offer = rpcOfferToHumanOffer({
      gives,
      tick,
      ba: BA.bids,
      baseDecimals: 18,
      quoteDecimals: market.quote.decimals,
    })
    bids.push({
      id: 0n,
      offer: { prev: 0n, next: 0n, tick, gives },
      detail: {
        maker: pool.pool,
        gasreq: gasEstimate,
        kilo_offer_gasbase: 0n,
        gasprice: 0n,
      },
      ...offer,
    })
  }

  return { asks, bids }
}

export function usePoolBook() {
  const { pool } = usePool()
  const client = useNetworkClient()
  const { defaultChain } = useDefaultChain()
  const { currentMarket: market } = useMarket()
  const { data: mangroveBook } = useMangroveBook()

  return useQuery({
    queryKey: [
      "pool-book",
      defaultChain?.id,
      pool?.pool,
      market?.base.address,
      market?.quote.address,
      mangroveBook?.asksConfig.density,
      mangroveBook?.bidsConfig.density,
      client?.key,
    ],
    queryFn: async () => {
      if (!client || !pool || !market || !mangroveBook) return null
      const quoteBalance =
        BigInt(market.base.address) < BigInt(market.quote.address)
          ? BigInt(pool.token1Balance)
          : BigInt(pool.token0Balance)
      const baseBalance =
        BigInt(market.base.address) < BigInt(market.quote.address)
          ? BigInt(pool.token0Balance)
          : BigInt(pool.token1Balance)
      const quoteAmount = BigInt(mangroveBook.bidsConfig.density) * 100000000n
      const baseAmount = BigInt(mangroveBook.asksConfig.density) * 100000000n

      const nOffers = 10

      // Calculate the maximum amount that can be used for quotes and base
      // Divide balance by 11 to ensure we have enough for multiple offers
      const maxQuoteAmount = quoteBalance / BigInt(nOffers + 1)
      const maxBaseAmount = baseBalance / BigInt(nOffers + 1)

      // Use the minimum between the calculated amount and available balance
      const quoteAmountToUse =
        quoteAmount < maxQuoteAmount ? quoteAmount : maxQuoteAmount
      const baseAmountToUse =
        baseAmount < maxBaseAmount ? baseAmount : maxBaseAmount

      return getPoolBook(
        client,
        market,
        quoteAmountToUse,
        baseAmountToUse,
        nOffers,
        pool,
      )
    },
  })
}

export function useMergedBooks() {
  const {
    data: mangroveBook,
    isLoading: mangroveBookLoading,
    refetch: refetchMangroveBook,
    isFetched: mangroveBookFetched,
  } = useMangroveBook()
  const {
    data: poolBook,
    isLoading: poolBookLoading,
    refetch: refetchPoolBook,
    isFetched: poolBookFetched,
  } = usePoolBook()

  const mergedBooks = {
    asks: [...(mangroveBook?.asks || []), ...(poolBook?.asks || [])].sort(
      (a, b) => a.price - b.price,
    ),
    bids: [...(mangroveBook?.bids || []), ...(poolBook?.bids || [])].sort(
      (a, b) => b.price - a.price,
    ),
  }

  return {
    mergedBooks,
    isLoading: mangroveBookLoading || poolBookLoading,
    isFetched: mangroveBookFetched || poolBookFetched,
    refetch: () => {
      refetchMangroveBook()
      refetchPoolBook()
    },
  }
}
