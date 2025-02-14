import { publicMarketActions, tickFromVolumes } from "@mangrovedao/mgv"
import { BA, rpcOfferToHumanOffer } from "@mangrovedao/mgv/lib"
import { useQuery } from "@tanstack/react-query"
import { Address, PublicClient } from "viem"
import { usePublicClient } from "wagmi"

import { quoterABI } from "@/app/abi/quoter"
import useMarket from "@/providers/market"
import { printEvmError } from "@/utils/errors"
import { Book } from "@mangrovedao/mgv"
import { useMangroveAddresses } from "./use-addresses"

export function useUniswapBook() {
  const { currentMarket } = useMarket()
  const client = usePublicClient()
  const addresses = useMangroveAddresses()

  const { data: uniswapQuotes } = useQuery({
    queryKey: [
      "uniswap-quotes",
      currentMarket?.base.address.toString(),
      currentMarket?.quote.address.toString(),
      client?.key,
    ],
    queryFn: async () => {
      try {
        if (!currentMarket || !client)
          throw new Error("Get quotes missing params")

        const marketClient = client.extend(
          publicMarketActions(addresses, currentMarket),
        )
        const book = await marketClient.getBook({})

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
    refetchInterval: 3000,
  })

  return { asks: uniswapQuotes?.asks || [], bids: uniswapQuotes?.bids || [] }
}

const QUOTES_PER_SIDE = 50
const DENSITY_MULTIPLIER_MIN = 0.8
const DENSITY_MULTIPLIER_RANGE = 0.4
const UNISWAP_FEE = 500
const AMOUNT_MULTIPLIER = 100000000n

export async function getUniswapQuotes(
  base: Address,
  quote: Address,
  book: Book,
  client: PublicClient,
) {
  if (!book) throw new Error("Book not found")

  try {
    const { quoterConfig } = await validateAndGetConfig(book)
    const { asksAmountSteps, bidsAmountSteps } = calculateAmountSteps(book)
    const quotes = await fetchUniswapQuotes(
      quoterConfig,
      { base, quote },
      { asksAmountSteps, bidsAmountSteps },
      client,
    )
    return processQuotes(quotes, { asksAmountSteps, bidsAmountSteps })
  } catch (error) {
    printEvmError(error)
    return { bids: [], asks: [] }
  }
}

async function validateAndGetConfig(book: Book) {
  if (!book) throw new Error("Book not found")

  const quoterAddress = "0x61fFE014bA17989E743c5F6cB21bF9697530B21e" as const
  if (!quoterAddress) throw new Error("Quoter address is required")
  if (!quoterABI) throw new Error("Quoter ABI is required")

  return {
    book,
    quoterConfig: { address: quoterAddress as `0x${string}`, abi: quoterABI },
  }
}

function calculateAmountSteps(book: Book) {
  const multiplier =
    DENSITY_MULTIPLIER_MIN + Math.random() * DENSITY_MULTIPLIER_RANGE

  const createSteps = (density: number) =>
    Array.from(
      { length: QUOTES_PER_SIDE },
      () => BigInt(Math.floor(density * multiplier)) * AMOUNT_MULTIPLIER,
    )

  return {
    asksAmountSteps: createSteps(Number(book.bidsConfig.density)),
    bidsAmountSteps: createSteps(Number(book.asksConfig.density)),
  }
}

async function fetchUniswapQuotes(
  quoterConfig: { address: `0x${string}`; abi: typeof quoterABI },
  tokens: { base: Address; quote: Address },
  steps: { asksAmountSteps: bigint[]; bidsAmountSteps: bigint[] },
  client: PublicClient,
) {
  if (!tokens.base || !tokens.quote) {
    throw new Error("Token addresses are required")
  }

  const createQuoteContract = (
    tokenIn: Address,
    tokenOut: Address,
    amountSteps: bigint[],
    index: number,
  ) =>
    ({
      address: quoterConfig.address,
      abi: quoterConfig.abi,
      functionName: "quoteExactInputSingle",
      args: [
        {
          tokenIn,
          tokenOut,
          amountIn: (amountSteps[index] as bigint) * BigInt(index + 1),
          fee: UNISWAP_FEE,
          sqrtPriceLimitX96: 0n,
        },
      ],
    }) as const

  return client.multicall({
    contracts: [
      ...Array.from({ length: QUOTES_PER_SIDE }, (_, i) =>
        createQuoteContract(
          tokens.quote,
          tokens.base,
          steps.asksAmountSteps,
          i,
        ),
      ),
      ...Array.from({ length: QUOTES_PER_SIDE }, (_, i) =>
        createQuoteContract(
          tokens.base,
          tokens.quote,
          steps.bidsAmountSteps,
          i,
        ),
      ),
    ],
    allowFailure: false,
  })
}

function processQuotes(
  quotes: Awaited<ReturnType<typeof fetchUniswapQuotes>>,
  steps: { asksAmountSteps: bigint[]; bidsAmountSteps: bigint[] },
) {
  const createOffer = (
    amountIn: bigint,
    amountOut: bigint,
    id: number,
    ba: typeof BA.asks | typeof BA.bids,
  ) => {
    const tick = tickFromVolumes(amountIn, amountOut, 1n)
    const rawOffer = rpcOfferToHumanOffer({
      gives: amountOut,
      tick,
      ba,
      baseDecimals: 18,
      quoteDecimals: 6,
    })

    return {
      ...rawOffer,
      offer: { tick, prev: 0n, next: 0n, gives: amountOut },
      id: BigInt(id),
      gasEstimate: 0,
      source: "uniswap",
      detail: {
        maker: "0x" as Address,
        gasreq: 0n,
        kilo_offer_gasbase: 0n,
        gasprice: 0n,
      },
    }
  }

  const processQuoteSide = (
    startIndex: number,
    amountSteps: bigint[],
    ba: typeof BA.asks | typeof BA.bids,
  ) => {
    const offers = []
    let previousAmountOut = 0n
    let previousGasEstimate = 0n

    for (let i = 0; i < QUOTES_PER_SIDE; i++) {
      const result = quotes[startIndex + i]
      if (!result) continue

      const [amountOutRaw, , , gasEstimateRaw] = result as [
        bigint,
        bigint,
        number,
        bigint,
      ]

      const amountIn = amountSteps[i] ?? 0n
      const amountOut = amountOutRaw - previousAmountOut
      previousAmountOut = amountOutRaw
      previousGasEstimate = gasEstimateRaw

      offers.push(createOffer(amountIn, amountOut, startIndex + i, ba))
    }
    return offers
  }

  return {
    asks: processQuoteSide(0, steps.asksAmountSteps, BA.asks),
    bids: processQuoteSide(QUOTES_PER_SIDE, steps.bidsAmountSteps, BA.bids),
  }
}
