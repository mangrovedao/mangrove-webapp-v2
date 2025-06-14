import type { Token } from "@mangrovedao/mgv"
import { MarketParams } from "@mangrovedao/mgv"

import icons from "@/generated/icons.json"
import type { useMarkets } from "@/hooks/use-addresses"
import { Address, erc20Abi, PublicClient } from "viem"

const IMG_BASE_PATH = "/cryptocurrency-icons/svg/color"

type IconType = Record<
  string,
  {
    name: string
    color: string
    symbol: string
  }
>

export function getTokenInfos(symbol: string) {
  const token = (icons as IconType)[symbol]

  if (!token) {
    return icons.GENERIC
  }
  return token
}

export function applyPriceDisplayDecimals(data?: any[]) {
  if (!data?.length) return []

  return data.map((item) => {
    const updateToken = (token: any) => {
      if (token?.symbol?.toLowerCase().includes("eth")) {
        token.priceDisplayDecimals = 6
        token.displayDecimals = 6
      }
    }

    if (item?.base && item?.quote) {
      updateToken(item.base)
      updateToken(item.quote)
    }

    return item
  })
}

export function getSvgUrl(symbol: string) {
  const token = getTokenInfos(symbol)
  if (token.name === "GENERIC") {
    const webpToken = getWebPUrl(symbol)
    return webpToken
  }
  return `${IMG_BASE_PATH}/${token.symbol.toLocaleLowerCase()}.svg`
}

export function getWebPUrl(symbol: string) {
  return `${IMG_BASE_PATH}/${symbol.toLocaleLowerCase()}.webp`
}

export function getTokenByAddress(
  address: string,
  markets: MarketParams[],
  odosTokens: Token[],
): Token | undefined {
  if (!address) return undefined
  if (!markets?.length && !odosTokens?.length) return undefined

  // Safe array handling
  const safeMarkets = markets || []
  const safeOdosTokens = odosTokens || []

  const token =
    safeMarkets.find(
      (m) => m?.base?.address?.toLowerCase() === address.toLowerCase(),
    )?.base ??
    safeMarkets.find(
      (m) => m?.quote?.address?.toLowerCase() === address.toLowerCase(),
    )?.quote ??
    safeOdosTokens.find(
      (t) => t?.address?.toLowerCase() === address.toLowerCase(),
    )

  return token
}

export async function getTokenSymbol(
  address: Address,
  client: PublicClient,
): Promise<string | undefined> {
  try {
    if (!address) return undefined

    const data = await client.readContract({
      address: address,
      abi: erc20Abi,
      functionName: "symbol",
    })

    return data
  } catch (e) {
    console.error("Error fetching token symbol:", e)
    return undefined
  }
}

export function getTokenByAddressOdos(
  address: string,
  odosTokens: Token[],
): Token | undefined {
  return odosTokens.find(
    (t) => t.address.toLowerCase() === address.toLowerCase(),
  )
}

export function getAllMangroveMarketTokens(markets: MarketParams[]): Token[] {
  const mangroveTokens = markets.reduce<Token[]>((acc, market) => {
    if (
      !acc.some(
        (t) => t.address.toLowerCase() === market.base.address.toLowerCase(),
      )
    ) {
      acc.push(market.base)
    }
    if (
      !acc.some(
        (t) => t.address.toLowerCase() === market.quote.address.toLowerCase(),
      )
    ) {
      acc.push(market.quote)
    }
    return acc
  }, [])

  return mangroveTokens
}

export function deduplicateTokens(tokens: Token[]) {
  return tokens.filter(
    (token, index, self) =>
      index ===
      self.findIndex(
        (t) => t.address.toLowerCase() === token.address.toLowerCase(),
      ),
  )
}

export function getMangroveTradeableTokens(
  markets: MarketParams[],
  token: Token,
): Token[] {
  return markets.reduce<Token[]>((acc, market) => {
    if (
      market.base.address.toLowerCase() === token.address.toLowerCase() &&
      !acc.some(
        (t) => t.address.toLowerCase() === market.quote.address.toLowerCase(),
      )
    ) {
      acc.push(market.quote)
    }
    if (
      market.quote.address.toLowerCase() === token.address.toLowerCase() &&
      !acc.some(
        (t) => t.address.toLowerCase() === market.base.address.toLowerCase(),
      )
    ) {
      acc.push(market.base)
    }
    return acc
  }, [])
}

export function getTradableTokens({
  markets,
  odosTokens,
  token,
}: {
  markets: MarketParams[]
  odosTokens: Token[]
  token?: Token
}): Token[] {
  if (!token) return []

  const mangroveTradableTokens = getMangroveTradeableTokens(markets, token)
  const odosTradableTokens = odosTokens.filter(
    (t) => t.address.toLowerCase() !== token.address.toLowerCase(),
  )

  return [...mangroveTradableTokens, ...odosTradableTokens]
}

export function getMarketFromTokens(
  markets: MarketParams[],
  base: Token | undefined,
  quote: Token | undefined,
) {
  if (!base || !quote) return null
  return markets.find(
    (m) =>
      (m.base.address.toLowerCase() === base.address.toLowerCase() &&
        m.quote.address.toLowerCase() === quote.address.toLowerCase()) ||
      (m.base.address.toLowerCase() === quote.address.toLowerCase() &&
        m.quote.address.toLowerCase() === base.address.toLowerCase()),
  )
}

export function getAllTokensInMarkets(markets: ReturnType<typeof useMarkets>) {
  return markets.reduce<Token[]>((acc, market) => {
    if (
      !acc.some(
        (t) => t.address.toLowerCase() === market.base.address.toLowerCase(),
      )
    ) {
      acc.push(market.base)
    }
    if (
      !acc.some(
        (t) => t.address.toLowerCase() === market.quote.address.toLowerCase(),
      )
    ) {
      acc.push(market.quote)
    }
    return acc
  }, [])
}

export const SEI_WRAP_CONTRACT = "0xE30feDd158A2e3b13e9badaeABaFc5516e95e8C7"

export const SEI_TOKEN = {
  address: "0x6f54391fe0386D506b51d69Deeb8b04E0544E088",
  symbol: "WSEI",
  name: "Wrapped SEI",
  decimals: 18,
  priceDisplayDecimals: 6,
  displayDecimals: 6,
  mgvTestToken: false,
}

export const NATIVE_SEI = {
  address: "0x0000000000000000000000000000000000000000",
  symbol: "SEI",
  name: "SEI",
  decimals: 18,
  priceDisplayDecimals: 6,
  displayDecimals: 6,
  mgvTestToken: false,
}
