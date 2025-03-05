/**
 * Module for interacting with Uniswap V3 style DEX orderbooks.
 * Provides functionality to:
 * 1. Generate simulated orderbook data by sampling liquidity at different price points
 * 2. Merge orderbook data from multiple sources (e.g. Uniswap + Mangrove)
 */

import type {
  Book,
  CompleteOffer,
  MarketParams,
  RpcCompleteOffer,
} from "@mangrovedao/mgv"
import {
  BA,
  MAX_TICK,
  rpcOfferToHumanOffer,
  tickFromVolumes,
} from "@mangrovedao/mgv/lib"
import crypto from "crypto"
import { zeroAddress, type Client, type ReadContractParameters } from "viem"
import { multicall } from "viem/actions"

import { uniquoterAbi } from "../abi/uniquoter"
import type { UniClone } from "../types"

/**
 * Generates an array of accumulated random amounts around an average value
 * Used to simulate varying trade sizes when sampling DEX liquidity
 *
 * @param avg - The average amount to generate variations around
 * @param n - Number of amounts to generate
 * @param variation - Amount of variation allowed (0-1), defaults to 0.4 (±20%)
 * @returns Array of accumulated amounts as bigints
 */
function generateRandomAmounts(
  avg: bigint,
  n: number,
  variation: number = 0.4,
) {
  // Generate n random variations around the average
  return Array.from({ length: n }, () => {
    const _variation = 1 - variation / 2 + Math.random() * variation
    return BigInt(Math.floor(Number(avg) * _variation))
  }).reduce((acc, curr) => {
    // Accumulate the amounts
    const last = acc.at(-1) ?? 0n
    acc.push(last + curr)
    return acc
  }, [] as bigint[])
}

/**
 * Generates a random offer ID using crypto.randomBytes
 * Used to give unique IDs to simulated offers
 *
 * @returns Random bigint suitable for use as offer ID
 */
function generateOfferId() {
  const buffer = crypto.randomBytes(8)
  return buffer.readBigInt64LE()
}

/**
 * Generates an array of RpcCompleteOffers from arrays of wants/gives amounts
 * Calculates proper ticks and accumulated amounts for each offer
 *
 * @param wantsArray - Array of accumulated wants amounts
 * @param givesArray - Array of accumulated gives amounts
 * @returns Array of RpcCompleteOffers with calculated ticks and amounts
 */
function generateOffersFormAccumulatedAmounts(
  wantsArray: bigint[],
  givesArray: bigint[],
): RpcCompleteOffer[] {
  let wantsAccumulated = 0n
  let givesAccumulated = 0n

  const offers: RpcCompleteOffer[] = []

  for (let i = 0; i < wantsArray.length; i++) {
    // Calculate incremental amounts from accumulated arrays
    const wants = wantsArray[i]! - wantsAccumulated
    const gives = givesArray[i]! - givesAccumulated

    wantsAccumulated += wants
    givesAccumulated += gives

    // Calculate price tick from volumes
    const tick = tickFromVolumes(wants, gives)

    // Create offer with minimal required fields
    offers.push({
      id: generateOfferId(),
      offer: {
        prev: 0n,
        next: 0n,
        tick,
        gives,
      },
      detail: {
        maker: zeroAddress,
        gasreq: 0n,
        kilo_offer_gasbase: 0n,
        gasprice: 0n,
      },
    })
  }

  return offers
}

/**
 * Gets simulated orderbook data from a Uniswap V3 style DEX by sampling liquidity
 * at different price points. Uses the DEX's quoter contract to get real pricing,
 * but simulates offer structure to match Mangrove's format.
 *
 * @param client - Viem client for making RPC calls
 * @param clone - Configuration for the specific Uniswap V3 clone
 * @param market - Market parameters including tokens and decimals
 * @param fee - Pool fee in basis points (e.g. 500 for 0.05%)
 * @param askWantsAvg - Average amount of quote token wanted for ask offers
 * @param bidWantsAvg - Average amount of base token wanted for bid offers
 * @param nOffers - Number of offers to generate per side
 * @returns Promise resolving to asks and bids arrays of CompleteOffers
 */
export async function getUniBook(
  client: Client,
  market: MarketParams,
  fee: number,
  askWantsAvg: bigint,
  bidWantsAvg: bigint,
  nOffers: number = 100,
  clone?: UniClone,
): Promise<{ asks: CompleteOffer[]; bids: CompleteOffer[] }> {
  if (!clone) throw new Error("Clone not found")
  // Generate arrays of random amounts around the averages
  const askWants = generateRandomAmounts(askWantsAvg, nOffers)
  const bidWants = generateRandomAmounts(bidWantsAvg, nOffers)

  // Get quotes for all amounts in a single multicall
  const result = await multicall(client, {
    contracts: askWants
      .map(
        (want) =>
          ({
            address: clone.quoter,
            abi: uniquoterAbi,
            functionName: "quoteExactInputSingle",
            args: [
              {
                tokenIn: market.quote.address,
                tokenOut: market.base.address,
                amountIn: want,
                fee: fee,
                sqrtPriceLimitX96: 0n,
              },
            ],
          }) satisfies ReadContractParameters<
            typeof uniquoterAbi,
            "quoteExactInputSingle"
          >,
      )
      .concat(
        bidWants.map(
          (want) =>
            ({
              address: clone.quoter,
              abi: uniquoterAbi,
              functionName: "quoteExactInputSingle",
              args: [
                {
                  tokenIn: market.base.address,
                  tokenOut: market.quote.address,
                  amountIn: want,
                  fee: fee,
                  sqrtPriceLimitX96: 0n,
                },
              ],
            }) satisfies ReadContractParameters<
              typeof uniquoterAbi,
              "quoteExactInputSingle"
            >,
        ),
      ),
    allowFailure: false,
  })

  // Split results into asks and bids gives amounts
  const asksGives = result.slice(0, nOffers).map((r) => r[0])
  const bidsGives = result.slice(nOffers, nOffers * 2).map((r) => r[0])

  // Generate raw offers from the amounts
  const rawAsks = generateOffersFormAccumulatedAmounts(askWants, asksGives)
  const rawBids = generateOffersFormAccumulatedAmounts(bidWants, bidsGives)

  // Convert raw offers to human readable format
  const asks: CompleteOffer[] = rawAsks.map((offer) => ({
    ...offer,
    ...rpcOfferToHumanOffer({
      ba: BA.asks,
      gives: offer.offer.gives,
      tick: offer.offer.tick,
      baseDecimals: market.base.decimals,
      quoteDecimals: market.quote.decimals,
    }),
  }))

  const bids: CompleteOffer[] = rawBids.map((offer) => ({
    ...offer,
    ...rpcOfferToHumanOffer({
      ba: BA.bids,
      gives: offer.offer.gives,
      tick: offer.offer.tick,
      baseDecimals: market.base.decimals,
      quoteDecimals: market.quote.decimals,
    }),
  }))

  return { asks, bids }
}

/**
 * Merges offers from multiple sources (e.g. Uniswap + Mangrove) into a single orderbook
 * Filters out offers that are worse than the best offer + fee from the base book
 *
 * @param asks - Array of ask offers to merge
 * @param bids - Array of bid offers to merge
 * @param book - Base book to merge into, containing fee configuration
 * @returns New Book with merged and filtered offers
 */
export function mergeOffers(
  asks: CompleteOffer[],
  bids: CompleteOffer[],
  book: Book,
): Book {
  // Calculate worst acceptable prices based on best offers
  const bestAskTick =
    (book.asks.at(0)?.offer.tick || MAX_TICK) + book.asksConfig.fee
  const bestBidTick =
    (book.bids.at(0)?.offer.tick || MAX_TICK) + book.bidsConfig.fee

  // Filter out offers worse than best + fee
  const _asks = asks.filter((a) => a.offer.tick <= bestAskTick)
  const _bids = bids.filter((b) => b.offer.tick <= bestBidTick)

  // Return new book with merged offers
  return {
    ...book,
    asks: _asks.concat(book.asks).reverse(),
    bids: _bids.concat(book.bids),
    // asks: _asks.reverse(),
    // bids: _bids,
  }
}
