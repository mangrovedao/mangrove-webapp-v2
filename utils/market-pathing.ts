import { useMangroveAddresses, useMarkets } from "@/hooks/use-addresses"
import { publicMarketActions } from "@mangrovedao/mgv"
import {
  arbitrumUSDC,
  arbitrumUSDT,
  baseSepoliaUSDC,
  blastUSDB,
  blastUSDe,
} from "@mangrovedao/mgv/addresses"
import aStar from "a-star"
import { checksumAddress } from "viem"
import { arbitrum, baseSepolia, blast } from "viem/chains"
import { usePublicClient } from "wagmi"
import { getMarketFromTokens, getTokenByAddress } from "./tokens"

const getPath = (
  t0: string,
  t1: string,
  markets: ReturnType<typeof useMarkets>,
) => {
  const graph: { [key: string]: Set<string> } = {}
  markets.forEach((m) => {
    const base = m.base.address.toLowerCase()
    const quote = m.quote.address.toLowerCase()
    if (!graph[base]) graph[base] = new Set()
    if (!graph[quote]) graph[quote] = new Set()

    graph[base]?.add(quote)
    graph[quote]?.add(base)
  })

  const isEnd = (node: string) => cmpAddr(node, t1)
  const neighbor = (node: string) => {
    const markets = graph as { [key: string]: Set<string> }
    return [...markets[node.toLowerCase()]!]
  }
  const opts = {
    start: t0,
    isEnd,
    neighbor,
    distance: () => 1,
    heuristic: () => 0,
  }
  const path = aStar(opts)
  if (path.status !== "success") throw new Error("No path found")

  return path.path as `0x${string}`[]
}

export const getPaths = (
  t0: string,
  t1: string[],
  markets: ReturnType<typeof useMarkets>,
) => {
  const paths = []
  for (const t of t1) {
    try {
      paths.push(getPath(t0, t, markets))
    } catch {}
  }

  return paths.sort((a, b) => a.length - b.length)[0]
}

export const getMarketPrice = async (
  market?: ReturnType<typeof useMarkets>[number],
  addresses?: ReturnType<typeof useMangroveAddresses>,
  publicClient?: ReturnType<typeof usePublicClient>,
) => {
  if (!market) return Number.NaN

  const client =
    addresses && publicClient?.extend(publicMarketActions(addresses, market))

  if (!client) return Number.NaN
  const book = await client?.getBook({ depth: 1n })
  if (!book) return Number.NaN

  const { asks, bids } = book

  const [firstAsk] = asks
  const [firstBid] = bids

  if (!firstAsk && !firstBid) return Number.NaN
  if (!firstAsk && firstBid) return firstBid.price
  if (!firstBid && firstAsk) return firstAsk.price

  if (firstAsk && firstBid) return (firstAsk.price + firstBid.price) / 2

  return Number.NaN
}

export const cmpAddr = (a?: string, b?: string) =>
  !!a &&
  !!b &&
  checksumAddress(a as `0x${string}`) === checksumAddress(b as `0x${string}`)

export const USD_TOKENS = {
  [arbitrum.id]: [arbitrumUSDC.address, arbitrumUSDT.address],
  [blast.id]: [blastUSDe.address, blastUSDB.address],
  [baseSepolia.id]: [baseSepoliaUSDC.address],
}

export const accPrice = (
  path: `0x${string}`[],
  chainId: keyof typeof USD_TOKENS,
  prices: {
    market?: { base: { address: string }; quote: { address: string } }
    price: number
  }[],
) => {
  const usdTokens = USD_TOKENS[chainId] as `0x${string}`[]

  let dollarAcc = 1
  for (let i = 0; i < path.length; i++) {
    if (usdTokens.includes(checksumAddress(path[i]!))) continue

    const price =
      prices
        .map(({ market, price }) => {
          const base = market!.base.address
          const quote = market!.quote.address
          const p1 = path[i]
          const p2 = path[i + 1]
          if (cmpAddr(base, p1) && cmpAddr(quote, p2)) return price
          if (cmpAddr(base, p2) && cmpAddr(quote, p1)) return 1 / price
          return null
        })
        .filter((p) => p !== null)[0] ?? 1

    dollarAcc *= price
  }

  return dollarAcc
}

export const accPrices = async ({
  chainId,
  receiveTknAddress,
  payTknAddress,
  markets,
  addresses,
  publicClient,
}: {
  chainId: keyof typeof USD_TOKENS
  receiveTknAddress: `0x${string}`
  payTknAddress: `0x${string}`
  markets: any
  addresses: ReturnType<typeof useMangroveAddresses>
  publicClient: ReturnType<typeof usePublicClient>
}) => {
  const usdTokens = USD_TOKENS[chainId] as `0x${string}`[]

  const payPath = getPaths(payTknAddress, usdTokens, markets)!
  const receivePath = getPaths(receiveTknAddress, usdTokens, markets)!

  let payDollar = 0
  let receiveDollar = 0

  if (!payPath || !receivePath) return null

  const simpleSwapPay = cmpAddr(payPath[1], receiveTknAddress)
  const simpleSwapReceive = cmpAddr(receivePath[1], payTknAddress)

  if (payPath.length === 1 && receivePath.length === 1) {
    return { payDollar: 1, receiveDollar: 1 }
  }

  // Special Cases: the send or receive token a USD token
  if (payPath.length === 1) payDollar = 1
  if (receivePath.length === 1) receiveDollar = 1

  if (payPath.length === 2 && simpleSwapPay) payDollar = receiveDollar
  if (receivePath.length === 2 && simpleSwapReceive) receiveDollar = payDollar

  const payPairs = payPath.length >= 2 ? pairUp(payPath) : []
  const receivePairs = receivePath.length >= 2 ? pairUp(receivePath) : []

  const getToken = (token: `0x${string}`) =>
    getTokenByAddress(checksumAddress(token), markets)

  const prices = await Promise.all(
    [...payPairs, ...receivePairs].map(async (pair) => {
      const token1 = getToken(pair[0]!)
      const token2 = getToken(pair[1]!)
      const market = getMarketFromTokens(markets, token1, token2)
      if (!market) return { pair, price: Number.NaN }
      const price = await getMarketPrice(market, addresses, publicClient)
      return { market, price }
    }),
  )

  return {
    payDollar: payDollar || accPrice(payPath, chainId, prices),
    receiveDollar: receiveDollar || accPrice(receivePath, chainId, prices),
  }
}

export const pairUp = (path: `0x${string}`[]) => {
  const pairs = []
  for (let i = 0; i < path.length - 1; i++) {
    pairs.push([path[i], path[i + 1]] as const)
  }

  return pairs
}
