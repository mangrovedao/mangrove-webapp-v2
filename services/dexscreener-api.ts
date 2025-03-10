/**
 * DEXScreener API Service
 *
 * This service provides methods to interact with the DEXScreener API
 * for fetching token pair data and chart information.
 */

import { arbitrum } from "viem/chains"

// Types for DEXScreener API responses
export interface DexScreenerPair {
  chainId: string
  dexId: string
  url: string
  pairAddress: string
  baseToken: {
    address: string
    name: string
    symbol: string
  }
  quoteToken: {
    address: string
    name: string
    symbol: string
  }
  priceNative: string
  priceUsd: string
  txns: {
    m5?: { buys: number; sells: number }
    h1?: { buys: number; sells: number }
    h6?: { buys: number; sells: number }
    h24?: { buys: number; sells: number }
  }
  volume: {
    m5?: number
    h1?: number
    h6?: number
    h24?: number
  }
  priceChange: {
    m5?: number
    h1?: number
    h6?: number
    h24?: number
  }
  liquidity: {
    usd: number
    base: number
    quote: number
  }
  fdv?: number
  marketCap?: number
}

export interface DexScreenerResponse {
  schemaVersion: string
  pairs: DexScreenerPair[]
}

export interface OHLCVBar {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

/**
 * Get the chain name used by DEXScreener API
 * @param chainId - The chain ID
 * @returns The chain name used by DEXScreener API
 */
export function getDexScreenerChainName(chainId: number): string {
  switch (chainId) {
    case arbitrum.id:
      return "arbitrum"
    case 1: // Ethereum mainnet
      return "ethereum"
    case 56: // BSC
      return "bsc"
    case 137: // Polygon
      return "polygon"
    case 43114: // Avalanche
      return "avalanche"
    case 42161: // Arbitrum One
      return "arbitrum"
    case 10: // Optimism
      return "optimism"
    default:
      return "ethereum"
  }
}

/**
 * Get pair information from DEXScreener
 * @param chainId - The chain ID
 * @param baseAddress - The base token address
 * @param quoteAddress - The quote token address
 * @returns The pair information
 */
export async function getPairInfo(
  chainId: number,
  baseAddress: string,
  quoteAddress: string,
): Promise<DexScreenerPair | null> {
  try {
    const chainName = getDexScreenerChainName(chainId)
    const pairAddress = `${baseAddress}_${quoteAddress}`
    const url = `https://api.dexscreener.com/latest/dex/pairs/${chainName}/${pairAddress}`

    console.log(`Fetching pair info from DEXScreener: ${url}`)
    const response = await fetch(url)
    const data = (await response.json()) as DexScreenerResponse

    if (!data || !data.pairs || data.pairs.length === 0) {
      console.log("No pair data found")
      return null
    }

    return data.pairs[0] || null
  } catch (error) {
    console.error("Error fetching pair info from DEXScreener:", error)
    return null
  }
}

/**
 * Generate OHLCV bars based on available price data
 * @param pair - The pair information
 * @param from - Start timestamp in seconds
 * @param to - End timestamp in seconds
 * @param resolution - Chart resolution (e.g., "1", "5", "15", "60", "1D")
 * @returns Array of OHLCV bars
 */
export function generateOHLCVBars(
  pair: DexScreenerPair,
  from: number,
  to: number,
  resolution: string,
): OHLCVBar[] {
  // Helper function to convert resolution to milliseconds
  const getResolutionInMs = (res: string): number => {
    if (res === "1D") return 24 * 60 * 60 * 1000
    if (res === "1W") return 7 * 24 * 60 * 60 * 1000
    if (res === "1M") return 30 * 24 * 60 * 60 * 1000
    return parseInt(res) * 60 * 1000
  }

  // Get current price and price changes
  const currentPrice = parseFloat(pair.priceUsd)
  const priceChange24h = pair.priceChange?.h24
    ? parseFloat(String(pair.priceChange.h24)) / 100
    : 0
  const volume24h = pair.volume?.h24 ? parseFloat(String(pair.volume.h24)) : 0

  // Calculate approximate price 24h ago
  const price24hAgo = currentPrice / (1 + priceChange24h)

  // Get price changes for different time periods
  const priceChange1h = pair.priceChange?.h1
    ? parseFloat(String(pair.priceChange.h1)) / 100
    : 0
  const priceChange6h = pair.priceChange?.h6
    ? parseFloat(String(pair.priceChange.h6)) / 100
    : 0

  // Calculate time range and number of bars
  const timeRange = to - from
  const resolutionMs = getResolutionInMs(resolution)
  const barCount = Math.min(200, Math.floor((timeRange * 1000) / resolutionMs))

  console.log(`Generating ${barCount} bars based on available price data`)

  const bars: OHLCVBar[] = []

  // Generate bars with realistic price movement
  for (let i = 0; i < barCount; i++) {
    const barTime = from * 1000 + i * resolutionMs
    const progress = i / barCount

    // Create a price that follows a realistic pattern
    // Use different price changes for different time periods
    let barPrice
    if (progress < 0.25) {
      // First quarter uses 1h change rate
      barPrice = price24hAgo * (1 + priceChange1h * progress * 4)
    } else if (progress < 0.5) {
      // Second quarter uses 6h change rate
      barPrice =
        price24hAgo *
        (1 + priceChange1h + priceChange6h * (progress - 0.25) * 4)
    } else {
      // Second half uses 24h change rate
      barPrice =
        price24hAgo *
        (1 +
          priceChange1h +
          priceChange6h +
          (priceChange24h - priceChange1h - priceChange6h) *
            (progress - 0.5) *
            2)
    }

    // Add some randomness to make it look more realistic
    const volatility = 0.005 // 0.5% volatility
    const randomFactor = 1 + (Math.random() * 2 - 1) * volatility

    const open = barPrice * randomFactor
    // For the close price, make it more likely to follow the trend
    const trendFactor =
      Math.random() > 0.3
        ? priceChange24h > 0
          ? 1 + Math.random() * volatility
          : 1 - Math.random() * volatility
        : priceChange24h > 0
          ? 1 - Math.random() * volatility
          : 1 + Math.random() * volatility
    const close = open * trendFactor

    const high = Math.max(open, close) * (1 + Math.random() * volatility)
    const low = Math.min(open, close) * (1 - Math.random() * volatility)

    // Volume should be higher during price movements
    const volumeFactor = 1 + Math.abs(trendFactor - 1) * 5
    const volume = (volume24h / barCount) * volumeFactor * (0.5 + Math.random())

    bars.push({
      time: barTime,
      open,
      high,
      low,
      close,
      volume,
    })
  }

  return bars
}

/**
 * Try to fetch OHLCV data from DEXScreener's chart endpoint
 * Note: This is experimental and may not work for all pairs
 * @param chainName - The chain name
 * @param pairAddress - The pair address
 * @param resolution - Chart resolution
 * @returns Array of OHLCV bars or null if not available
 */
export async function tryFetchOHLCVData(
  chainName: string,
  pairAddress: string,
  resolution: string,
): Promise<OHLCVBar[] | null> {
  try {
    // This is a theoretical endpoint - you may need to adjust based on actual availability
    const chartUrl = `https://io.dexscreener.com/dex/chart/amm/v3/uniswap/bars/${chainName}/${pairAddress}?res=${resolution === "1D" ? "1D" : resolution}`

    console.log("Attempting to fetch chart data from:", chartUrl)
    const response = await fetch(chartUrl)
    const chartData = await response.json()

    if (chartData && chartData.bars && chartData.bars.length > 0) {
      console.log(
        "Successfully fetched chart data:",
        chartData.bars.length,
        "bars",
      )

      return chartData.bars.map((bar: any) => ({
        time: bar.t * 1000, // Convert to milliseconds
        open: parseFloat(bar.o),
        high: parseFloat(bar.h),
        low: parseFloat(bar.l),
        close: parseFloat(bar.c),
        volume: parseFloat(bar.v || 0),
      }))
    }

    return null
  } catch (error) {
    console.warn("Failed to fetch chart data:", error)
    return null
  }
}
