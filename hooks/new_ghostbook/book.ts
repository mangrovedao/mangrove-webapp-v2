import { CompleteOffer, MarketParams, tickFromVolumes } from "@mangrovedao/mgv"
import { getBook } from "@mangrovedao/mgv/actions"
import { BA, multiplyDensity, rpcOfferToHumanOffer } from "@mangrovedao/mgv/lib"
import { useQuery } from "@tanstack/react-query"
import React from "react"
import {
  Abi,
  Address,
  ContractFunctionReturnType,
  Hex,
  MulticallParameters,
  PublicClient,
} from "viem"

import useMarket from "@/providers/market"
import { useSelectedPoolStore } from "@/stores/selected-pool.store"
import { useMangroveAddresses } from "../use-addresses"
import { useDefaultChain } from "../use-default-chain"
import { useNetworkClient } from "../use-network-client"
import { jellyverseQuoterABI, uniQuoterABI } from "./abi/quoter"
import {
  FeePool,
  JellyverseV2Pool,
  Pool,
  ProtocolType,
  TickSpacingPool,
  usePool,
} from "./pool"

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
interface ProtocolSwapCalculator {
  calculateSwap(
    tokenIn: Address,
    tokenOut: Address,
    amountIn: bigint,
    pool: Pool,
  ): MulticallParameters["contracts"][number][]
  parseResult(
    result: ContractFunctionReturnType<Abi>,
  ): [amountOut: bigint, gasEstimate: bigint]
}

function getSwapCalculator(type: ProtocolType): ProtocolSwapCalculator {
  switch (type) {
    case ProtocolType.Slipstream:
      return new SlipstreamSwapCalculator()
    case ProtocolType.UniswapV3:
      return new UniSwapCalculator()
    case ProtocolType.JellyverseV2:
      return new JellyverseSwapCalculator()
    default:
      return new UniSwapCalculator()
  }
}
class UniSwapCalculator implements ProtocolSwapCalculator {
  calculateSwap(
    tokenIn: Address,
    tokenOut: Address,
    amountIn: bigint,
    pool: FeePool,
  ): MulticallParameters["contracts"][number][] {
    return [
      {
        address: pool.protocol.quoter,
        abi: uniQuoterABI,
        functionName: "quoteExactInputSingle",
        args: [
          {
            tokenIn,
            tokenOut,
            amountIn,
            fee: pool.fee,
            tickSpacing: undefined,
            sqrtPriceLimitX96: 0n,
          },
        ],
      },
    ]
  }
  parseResult(
    result: ContractFunctionReturnType<
      typeof uniQuoterABI,
      "view",
      "quoteExactInputSingle"
    >,
  ): [amountOut: bigint, gasEstimate: bigint] {
    const [amountOutRaw, , , gasEstimateRaw] = result as [
      bigint,
      bigint,
      bigint,
      bigint,
    ]
    return [amountOutRaw, gasEstimateRaw]
  }
}
class SlipstreamSwapCalculator implements ProtocolSwapCalculator {
  calculateSwap(
    tokenIn: Address,
    tokenOut: Address,
    amountIn: bigint,
    pool: TickSpacingPool,
  ): MulticallParameters["contracts"][number][] {
    return [
      {
        address: pool.protocol.quoter,
        abi: uniQuoterABI,
        functionName: "quoteExactInputSingle",
        args: [
          {
            tokenIn,
            tokenOut,
            amountIn,
            fee: undefined,
            tickSpacing: pool.tickSpacing,
            sqrtPriceLimitX96: 0n,
          },
        ],
      },
    ]
  }
  parseResult(
    result: ContractFunctionReturnType<
      typeof uniQuoterABI,
      "view",
      "quoteExactInputSingle"
    >,
  ): [amountOut: bigint, gasEstimate: bigint] {
    const [amountOutRaw, , , gasEstimateRaw] = result as [
      bigint,
      bigint,
      bigint,
      bigint,
    ]
    return [amountOutRaw, gasEstimateRaw]
  }
}
class JellyverseSwapCalculator implements ProtocolSwapCalculator {
  private readonly gasEstimate = 1000n

  calculateSwap(
    tokenIn: Address,
    tokenOut: Address,
    amountIn: bigint,
    pool: JellyverseV2Pool,
  ): MulticallParameters["contracts"][number][] {
    return [{
        address: pool.protocol.vault,
        abi: jellyverseQuoterABI,
        functionName: "queryBatchSwap",
        args: [
          0,
          [{
            poolId: pool.poolId,
            assetInIndex: 0,
            assetOutIndex: 1,
            amount: amountIn,
            userData: "0x0000000000000000000000000000000000000000000000000000000000000000",
          }],
          [tokenIn, tokenOut],
          {
            sender: "0x0000000000000000000000000000000000000000",
            fromInternalBalance: false,
            recipient: "0x0000000000000000000000000000000000000000",
            toInternalBalance: false
          },
        ]
      }
    ]
  }
  parseResult(
    result: ContractFunctionReturnType<
      typeof jellyverseQuoterABI,
      "view",
      "queryBatchSwap"
    >,
  ): [amountOut: bigint, gasEstimate: bigint] {
    const [_, amount2] = result as [bigint, bigint]
    return [-1n * amount2, this.gasEstimate]
  }
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
  const swapsCalculator = getSwapCalculator(pool.protocol.type)
  const quotes = await client.multicall({
    contracts: [
      // Asks quotes (WETH -> USDC)
      ...quoteAmountsIn
        .map((amountIn) =>
          swapsCalculator.calculateSwap(
            market.quote.address,
            market.base.address,
            amountIn,
            pool,
          ),
        )
        .flat(),
      // Bids quotes (USDC -> WETH)
      ...baseAmountsIn
        .map((amountIn) =>
          swapsCalculator.calculateSwap(
            market.base.address,
            market.quote.address,
            amountIn,
            pool,
          ),
        )
        .flat(),
    ],
    batchSize: 5096,
    allowFailure: false,
  })

  let previousAsksAmountOut = 0n
  let previousAsksGasEstimate = 0n
  const asks: CompleteOffer[] = []
  for (let i = 0; i < nOffers; i++) {
    const [amountOutRaw, gasEstimateRaw] = swapsCalculator.parseResult(
      quotes[i],
    )
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
    const [amountOutRaw, gasEstimateRaw] = swapsCalculator.parseResult(quotes[i])
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
      baseDecimals: market.base.decimals,
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
  const { selectedPool, setSelectedPool } = useSelectedPoolStore()

  // Update the store with the current pool
  React.useEffect(() => {
    if (pool !== selectedPool) {
      setSelectedPool(pool)
    }
  }, [pool])

  return useQuery({
    queryKey: [
      "pool-book",
      defaultChain?.id,
      pool,
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

      const quoteAmount = multiplyDensity(
        mangroveBook.bidsConfig.density,
        100000000n,
      )
      const baseAmount = multiplyDensity(
        mangroveBook.asksConfig.density,
        100000000n,
      )

      const nOffers = 10

      // Calculate the maximum amount that can be used for quotes and base
      // Divide balance by 11 to ensure we have enough for multiple offers
      const maxQuoteAmount = quoteBalance / BigInt(nOffers * 2)
      const maxBaseAmount = baseBalance / BigInt(nOffers * 2)

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
        pool as Pool,
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

  const lowestAsk = mergedBooks?.asks[0]?.price || 0
  const highestBid = mergedBooks?.bids[0]?.price || 0

  let spotPrice = 0
  if (lowestAsk && highestBid) {
    spotPrice = (lowestAsk + highestBid) / 2
  } else if (!lowestAsk && !highestBid) {
    spotPrice = 0
  } else {
    spotPrice = Math.max(lowestAsk || 0, highestBid || 0)
  }

  return {
    mergedBooks,
    isLoading: mangroveBookLoading || poolBookLoading,
    isFetched: mangroveBookFetched || poolBookFetched,
    spotPrice,
    refetch: () => {
      refetchMangroveBook()
      refetchPoolBook()
    },
  }
}
