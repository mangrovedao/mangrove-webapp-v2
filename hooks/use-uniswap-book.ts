import { tickFromVolumes } from "@mangrovedao/mgv"
import { BA, rpcOfferToHumanOffer } from "@mangrovedao/mgv/lib"
import { useQuery } from "@tanstack/react-query"
import { Address, PublicClient } from "viem"
import { usePublicClient } from "wagmi"

import { quoterABI } from "@/app/abi/quoter"
import { useBook } from "@/hooks/use-book"
import useMarket from "@/providers/market"
import { printEvmError } from "@/utils/errors"
import { useMarketClient } from "./use-market"

export function useUniswapBook() {
  const { currentMarket } = useMarket()
  const { book } = useBook()
  const client = usePublicClient()
  const marketClient = useMarketClient()

  const { data: uniswapQuotes } = useQuery({
    queryKey: [
      "uniswap-quotes",
      currentMarket?.base.address.toString(),
      currentMarket?.quote.address.toString(),
      book?.asks[0]?.price.toString(),
      book?.bids[0]?.price.toString(),
      client?.key,
    ],
    queryFn: async () => {
      try {
        if (!currentMarket || !client)
          throw new Error("Get quotes missing params")

        return await getUniswapQuotes(
          currentMarket.base.address,
          currentMarket.quote.address,
          marketClient,
          client,
        )
      } catch (error) {
        printEvmError(error)
        return { asks: [], bids: [] }
      }
    },
    enabled: !!currentMarket,
    refetchInterval: 3000,
  })

  return { asks: uniswapQuotes?.asks || [], bids: uniswapQuotes?.bids || [] }
}

export async function getUniswapQuotes(
  base: Address,
  quote: Address,
  marketClient: ReturnType<typeof useMarketClient>,
  client: PublicClient,
) {
  if (!marketClient) return { bids: [], asks: [] }

  try {
    const QUOTES_PER_SIDE = 50
    const book = await marketClient.getBook({})
    if (!book) throw new Error("Book not found")

    const multiplier = 0.8 + Math.random() * 0.4
    const asksAmountSteps = Array.from({ length: QUOTES_PER_SIDE }, () => {
      return (
        BigInt(Math.floor(Number(book.bidsConfig.density) * multiplier)) *
        100000000n
      )
    })

    const bidsAmountSteps = Array.from({ length: QUOTES_PER_SIDE }, () => {
      return (
        BigInt(Math.floor(Number(book.asksConfig.density) * multiplier)) *
        100000000n
      )
    })

    //note: this is the address of the quoter on arbitrum
    const quoterAddress = "0x61fFE014bA17989E743c5F6cB21bF9697530B21e"

    if (!quoterAddress) throw new Error("Quoter address is required")
    if (!quoterABI) throw new Error("Quoter ABI is required")
    if (!base) throw new Error("Base token address is required")
    if (!quote) throw new Error("Quote token address is required")

    const quotes = await client.multicall({
      contracts: [
        ...Array.from(
          { length: QUOTES_PER_SIDE },
          (_, i) =>
            ({
              address: quoterAddress,
              abi: quoterABI,
              functionName: "quoteExactInputSingle",
              args: [
                {
                  tokenIn: quote,
                  tokenOut: base,
                  amountIn: (asksAmountSteps[i] as bigint) * BigInt(i + 1),
                  fee: 500,
                  sqrtPriceLimitX96: 0n,
                },
              ],
            }) as const,
        ),
        ...Array.from(
          { length: QUOTES_PER_SIDE },
          (_, i) =>
            ({
              address: quoterAddress,
              abi: quoterABI,
              functionName: "quoteExactInputSingle",
              args: [
                {
                  tokenIn: base,
                  tokenOut: quote,
                  amountIn: (bidsAmountSteps[i] as bigint) * BigInt(i + 1),
                  fee: 500,
                  sqrtPriceLimitX96: 0n,
                },
              ],
            }) as const,
        ),
      ],
      allowFailure: false,
    })

    const asks = []
    let previousAsksAmountOut = 0n
    let previousAsksGasEstimate = 0n
    for (let i = 0; i < QUOTES_PER_SIDE; i++) {
      const result = quotes[i]
      if (!result) continue
      const [amountOutRaw, , , gasEstimateRaw] = result as [
        bigint,
        bigint,
        number,
        bigint,
      ]
      const amountIn = asksAmountSteps[i] as bigint
      const amountOut = amountOutRaw - previousAsksAmountOut
      previousAsksAmountOut = amountOutRaw
      const gasEstimate = gasEstimateRaw - previousAsksGasEstimate
      previousAsksGasEstimate = gasEstimateRaw


      const tick = tickFromVolumes(amountIn, amountOut, 1n)
      const gives = amountOut
      const rawOffer = rpcOfferToHumanOffer({
        gives,
        tick,
        ba: BA.asks,
        baseDecimals: 18,
        quoteDecimals: 6,
      })

      // Format the numbers to be more readable
      const formattedOffer = {
        ...rawOffer,
        offer: {
          tick,
          prev: 0n,
          next: 0n,
          gives,
        },
        price: Number(rawOffer.price),
        total: Number(rawOffer.total),
        volume: Number(rawOffer.volume),
        id: BigInt(i),
        gasEstimate: 0,
        source: "uniswap",
        detail: {
          maker: "0x" as Address,
          gasreq: 0n,
          kilo_offer_gasbase: 0n,
          gasprice: 0n,
        },
      }
      asks.push(formattedOffer)
    }

    const bids = []
    let previousBidsAmountOut = 0n
    let previousBidsGasEstimate = 0n
    for (let i = QUOTES_PER_SIDE; i < QUOTES_PER_SIDE * 2; i++) {
      const result = quotes[i]
      if (!result) continue
      const [amountOutRaw, , , gasEstimateRaw] = result as [
        bigint,
        bigint,
        number,
        bigint,
      ]

      const amountIn = bidsAmountSteps[i - QUOTES_PER_SIDE] ?? 0n
      const amountOut = amountOutRaw - previousBidsAmountOut

      previousBidsAmountOut = amountOutRaw
      const gasEstimate = gasEstimateRaw - previousBidsGasEstimate
      previousBidsGasEstimate = gasEstimateRaw
      const tick = tickFromVolumes(amountIn, amountOut, 1n)

      const gives = amountOut

      const rawOffer = rpcOfferToHumanOffer({
        gives,
        tick,
        ba: BA.bids,
        baseDecimals: 18,
        quoteDecimals: 6,
      })

      // todo: format the numbers to be more readable
      const formattedOffer = {
        ...rawOffer,
        offer: { tick, prev: 0n, next: 0n, gives },
        price: Number(rawOffer.price),
        total: Number(rawOffer.total),
        volume: Number(rawOffer.volume),
        id: BigInt(i),
        gasEstimate: 0,
        source: "uniswap",
        detail: {
          maker: "0x" as Address,
          gasreq: 0n,
          kilo_offer_gasbase: 0n,
          gasprice: 0n,
        },
      }
      bids.push(formattedOffer)
    }

    return { bids, asks }
  } catch (error) {
    printEvmError(error)
    return { bids: [], asks: [] }
  }
}
