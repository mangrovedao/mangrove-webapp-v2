import { Token } from "@mangrovedao/mgv"
import { useState } from "react"

const API_URL = "https://api.odos.xyz"
const API_ROUTES = {
  TOKEN_LIST: (chainId: number) => `/info/tokens/${chainId}`,
  QUOTE: "/sor/quote/v2",
  ASSEMBLE: "/sor/assemble",
}
export const API_IMAGE_URL = (symbol: string) =>
  `https://assets.odos.xyz/tokens/${symbol}.webp`

export function useOdos(chainId: number) {
  const [odosTokens, setOdosTokens] = useState<Token[]>([])
  const [error, setError] = useState<Error | null>(null)

  async function fetchTokens() {
    try {
      const response = await fetch(API_URL + API_ROUTES.TOKEN_LIST(chainId))
      const data: any = await response.json()

      const tokenMap = data.tokenMap
      const addresses = Object.keys(tokenMap)
      const tokenInfo = addresses.map((address: string) => tokenMap[address])
      const newTokens = tokenInfo.map((token: any, index: number) => ({
        address: addresses[index] as `0x${string}`,
        symbol: token.symbol,
        decimals: token.decimals,
        displayDecimals: token.decimals,
        priceDisplayDecimals: 2,
        mgvTestToken: false,
      }))

      setOdosTokens(newTokens)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch tokens"))
    }
  }

  return { odosTokens, error }
}
