import { tickFromVolumes, Token } from "@mangrovedao/mgv"
import { BA, rpcOfferToHumanOffer } from "@mangrovedao/mgv/lib"
import { useQuery } from "@tanstack/react-query"
import { Address, PublicClient } from "viem"

import { quoterABI } from "@/app/abi/quoter"
import useMarket from "@/providers/market"
import { printEvmError } from "@/utils/errors"
import { Book } from "@mangrovedao/mgv"
import { useAccount } from "wagmi"
import { useBook } from "./use-book"
import { useNetworkClient } from "./use-network-client"

export function useUniswapBook() {
  const { currentMarket } = useMarket()
  const client = useNetworkClient()
  const { book } = useBook()
  const { chain } = useAccount()

  const { data: uniswapQuotes } = useQuery({
    queryKey: [
      "uniswap-quotes",
      currentMarket?.base.address.toString(),
      currentMarket?.quote.address.toString(),
      chain?.id,
      client?.key,
    ],
    queryFn: async () => {
      try {
        if (!currentMarket || !client || !book)
          throw new Error("Get quotes missing params")

        return await getUniswapQuotes(
          currentMarket.base,
          currentMarket.quote,
          book,
          client,
        )
      } catch (error) {
        printEvmError(error)
        return { asks: [], bids: [] }
      }
    },
    enabled: !!currentMarket && !!client && !!book,
    refetchInterval: 3000,
  })

  return { asks: uniswapQuotes?.asks || [], bids: uniswapQuotes?.bids || [] }
}

const QUOTES_PER_SIDE = 20
const DENSITY_MULTIPLIER_MIN = 0.8
const DENSITY_MULTIPLIER_RANGE = 0.4
const UNISWAP_FEE = 500
const AMOUNT_MULTIPLIER = 100000000n

export async function getUniswapQuotes(
  base: Token,
  quote: Token,
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

    return processQuotes(
      quotes,
      { asksAmountSteps, bidsAmountSteps },
      { base, quote },
    )
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
  tokens: { base: Token; quote: Token },
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
          tokens.quote.address,
          tokens.base.address,
          steps.asksAmountSteps,
          i,
        ),
      ),
      ...Array.from({ length: QUOTES_PER_SIDE }, (_, i) =>
        createQuoteContract(
          tokens.base.address,
          tokens.quote.address,
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
  tokens: { base: Token; quote: Token },
) {
  const createOffer = (
    amountIn: bigint,
    amountOut: bigint,
    id: number,
    ba: typeof BA.asks | typeof BA.bids,
    tokens: { base: Token; quote: Token },
  ) => {
    const tick = tickFromVolumes(amountIn, amountOut, 1n)
    const rawOffer = rpcOfferToHumanOffer({
      gives: amountOut,
      tick,
      ba,
      baseDecimals: tokens.base.decimals,
      quoteDecimals: tokens.quote.decimals,
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
    tokens: { base: Token; quote: Token },
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

      offers.push(createOffer(amountIn, amountOut, startIndex + i, ba, tokens))
    }
    return offers
  }

  return {
    asks: processQuoteSide(0, steps.asksAmountSteps, BA.asks, tokens),
    bids: processQuoteSide(
      QUOTES_PER_SIDE,
      steps.bidsAmountSteps,
      BA.bids,
      tokens,
    ),
  }
}
