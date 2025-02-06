import { Book, tickFromVolumes } from "@mangrovedao/mgv"
import { BA, rpcOfferToHumanOffer } from "@mangrovedao/mgv/lib"
import { useQuery } from "@tanstack/react-query"
import { Address, PublicClient } from "viem"
import { usePublicClient } from "wagmi"

import { quoterABI } from "@/app/abi/quoter"
import { useBook } from "@/hooks/use-book"
import useMarket from "@/providers/market"
import { printEvmError } from "@/utils/errors"

export function useUniswapBook() {
  const { currentMarket } = useMarket()
  const { book } = useBook()
  const client = usePublicClient()

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
        if (!currentMarket || !book || !client)
          throw new Error("Get quotes missing params")

        return await getUniswapQuotes(
          currentMarket.base.address,
          currentMarket.quote.address,
          book,
          client,
        )
      } catch (error) {
        printEvmError(error)
        return { asks: [], bids: [] }
      }
    },
    enabled: !!currentMarket,
    staleTime: 5000,
    refetchInterval: 10000,
  })

  return { asks: uniswapQuotes?.asks || [], bids: uniswapQuotes?.bids || [] }
}

export async function getUniswapQuotes(
  base: Address,
  quote: Address,
  book: Book,
  client: PublicClient,
) {
  try {
    const asksAmountStep = BigInt(book.asksConfig.density) * 10000000000n
    const bidsAmountStep = BigInt(book.bidsConfig.density) * 10000000000n

    //note: this is the address of the quoter on arbitrum
    const quoterAddress = "0x61fFE014bA17989E743c5F6cB21bF9697530B21e"

    // Validate all required parameters before making multicall
    if (!quoterAddress) throw new Error("Quoter address is required")
    if (!quoterABI) throw new Error("Quoter ABI is required")
    if (!base) throw new Error("Base token address is required")
    if (!quote) throw new Error("Quote token address is required")
    if (!asksAmountStep) throw new Error("Asks amount step is required")
    if (!bidsAmountStep) throw new Error("Bids amount step is required")

    const quotes = await client.multicall({
      contracts: [
        ...Array.from(
          { length: 10 },
          (_, i) =>
            ({
              address: quoterAddress,
              abi: quoterABI,
              functionName: "quoteExactInputSingle",
              args: [
                {
                  tokenIn: base,
                  tokenOut: quote,
                  amountIn: asksAmountStep * BigInt(i + 1),
                  fee: 500,
                  sqrtPriceLimitX96: 0n,
                },
              ],
            }) as const,
        ),
        ...Array.from(
          { length: 10 },
          (_, i) =>
            ({
              address: quoterAddress,
              abi: quoterABI,
              functionName: "quoteExactInputSingle",
              args: [
                {
                  tokenIn: quote,
                  tokenOut: base,
                  amountIn: bidsAmountStep * BigInt(i + 1),
                  fee: 500,
                  sqrtPriceLimitX96: 0n,
                },
              ],
            }) as const,
        ),
      ],
      allowFailure: false, // Changed to true to handle potential failures gracefully
    })

    const asks = []
    let previousAsksAmountOut = 0n
    let previousAsksGasEstimate = 0n
    for (let i = 0; i < 10; i++) {
      const result = quotes[i]
      if (!result) continue
      const [amountOutRaw, , , gasEstimateRaw] = result as [
        bigint,
        bigint,
        number,
        bigint,
      ]
      const amountIn = asksAmountStep
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
          prev: BigInt(i - 1),
          next: BigInt(i + 1),
          gives,
        },
        price: Number(rawOffer.price) / 1e18, // Convert from wei to ETH
        total: Number(rawOffer.total), // Remove toFixed()
        volume: Number(rawOffer.volume), // Remove toFixed()
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
    for (let i = 10; i < 20; i++) {
      const result = quotes[i]
      if (!result) continue
      const [amountOutRaw, , , gasEstimateRaw] = result as [
        bigint,
        bigint,
        number,
        bigint,
      ]
      const amountIn = bidsAmountStep
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
        offer: { tick, prev: BigInt(i - 1), next: BigInt(i + 1), gives },
        price: Number(rawOffer.price) / 1e18,
        total: Number(rawOffer.total), // Remove toFixed()
        volume: Number(rawOffer.volume), // Remove toFixed()
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
