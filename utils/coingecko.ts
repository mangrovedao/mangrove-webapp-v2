// Token address to CoinGecko ID mapping
export const TOKEN_TO_COINGECKO_ID: Record<string, string> = {
  // Native tokens
  ETH: "ethereum",

  // Ethereum mainnet
  "1_WBTC": "bitcoin",
  "1_WETH": "ethereum",
  "1_USDC": "usd-coin",
  "1_USDT": "tether",
  "1_DAI": "dai",

  // Arbitrum
  "42161_WETH": "ethereum",
  "42161_USDC.e": "usd-coin",
  "42161_USDC": "usd-coin",
  "42161_USDT": "tether",
  "42161_WBTC": "bitcoin",
  "42161_ARB": "arbitrum",
  "42161_weETH": "staked-ether",

  // Base
  "8453_WETH": "ethereum",
  "8453_USDC": "usd-coin",
  "8453_DAI": "dai",
  "8453_cbBTC": "coinbase-wrapped-btc",
  "8453_cbETH": "coinbase-wrapped-staked-eth",
  "8453_wstETH": "staked-ether",

  // SEI
  "1329_WSEI": "sei-network",
  "1329_USDC": "usd-coin",
  "1329_WETH": "ethereum",
  "1329_WBTC": "bitcoin",
}

/**
 * Get CoinGecko token ID from token address
 */
export function getCoinGeckoTokenId(
  chainId: number,
  symbol: string,
): string | null {
  return TOKEN_TO_COINGECKO_ID[`${chainId}_${symbol}`] || null
}

/**
 * Fetch token price from CoinGecko API
 */
export async function fetchTokenPriceFromCoinGecko(
  tokenId: string,
): Promise<number | null> {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${tokenId}&vs_currencies=usd`,
    )

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const data = await response.json()
    return data[tokenId]?.usd || null
  } catch (error) {
    console.error(`Failed to fetch price for ${tokenId} from CoinGecko:`, error)
    return null
  }
}

/**
 * Fetch multiple token prices from CoinGecko API
 */
export async function fetchTokenPricesFromCoinGecko(
  tokenIds: string[],
): Promise<Record<string, number>> {
  try {
    const idsString = tokenIds.join(",")

    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${idsString}&vs_currencies=usd`,
    )

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const data = await response.json()
    const result: Record<string, number> = {}

    for (const tokenId of tokenIds) {
      if (data[tokenId]?.usd) {
        result[tokenId] = data[tokenId].usd
      }
    }

    return result
  } catch (error) {
    console.error("Failed to fetch prices from CoinGecko:", error)
    return {}
  }
}
