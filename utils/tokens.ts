import type { useMarkets } from "@/hooks/use-addresses"
import type { Token } from "@mangrovedao/mgv"

import icons from "@/generated/icons.json"
import { MarketParams } from "@mangrovedao/mgv"

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
  const token =
    markets.find((m) => m.base.address === address)?.base ??
    markets.find((m) => m.quote.address === address)?.quote ??
    odosTokens.find((t) => t.address === address)

  return token
}

export function getTokenByAddressOdos(
  address: string,
  odosTokens: Token[],
): Token | undefined {
  return odosTokens.find((t) => t.address === address)
}

export function getAllMangroveMarketTokens(
  mangroveMarkets: ReturnType<typeof useMarkets>,
): Token[] {
  const mangroveTokens = mangroveMarkets.reduce<Token[]>((acc, market) => {
    if (!acc.some((t) => t.address === market.base.address)) {
      acc.push(market.base)
    }
    if (!acc.some((t) => t.address === market.quote.address)) {
      acc.push(market.quote)
    }
    return acc
  }, [])

  return mangroveTokens
}

export function deduplicateTokens(tokens: Token[]) {
  return tokens.filter(
    (token, index, self) =>
      index === self.findIndex((t) => t.address === token.address),
  )
}

export function getMangroveTradeableTokens(
  mangroveMarkets: ReturnType<typeof useMarkets>,
  token: Token,
): Token[] {
  return mangroveMarkets.reduce<Token[]>((acc, market) => {
    if (
      market.base.address === token.address &&
      !acc.some((t) => t.address === market.quote.address)
    ) {
      acc.push(market.quote)
    }
    if (
      market.quote.address === token.address &&
      !acc.some((t) => t.address === market.base.address)
    ) {
      acc.push(market.base)
    }
    return acc
  }, [])
}

export function getTradableTokens({
  mangroveMarkets,
  odosTokens,
  token,
}: {
  mangroveMarkets: ReturnType<typeof useMarkets>
  odosTokens: Token[]
  token?: Token
}): Token[] {
  if (!token) return []

  const mangroveTradableTokens = getMangroveTradeableTokens(
    mangroveMarkets,
    token,
  )
  const odosTradableTokens = odosTokens.filter(
    (t) => t.address !== token.address,
  )

  return [...mangroveTradableTokens, ...odosTradableTokens]
}

export function getMarketFromTokens(
  markets: ReturnType<typeof useMarkets>,
  base: Token | undefined,
  quote: Token | undefined,
) {
  if (!base || !quote) return null
  return markets.find(
    (m) =>
      (m.base.address === base.address && m.quote.address === quote.address) ||
      (m.base.address === quote.address && m.quote.address === base.address),
  )
}

export function getAllTokensInMarkets(markets: ReturnType<typeof useMarkets>) {
  return markets.reduce<Token[]>((acc, market) => {
    if (!acc.some((t) => t.address === market.base.address)) {
      acc.push(market.base)
    }
    if (!acc.some((t) => t.address === market.quote.address)) {
      acc.push(market.quote)
    }
    return acc
  }, [])
}
