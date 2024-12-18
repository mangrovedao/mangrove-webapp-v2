import { useQuery } from "@tanstack/react-query"

const API_URL = "https://api.odos.xyz"
const API_ROUTES = {
  TOKEN_LIST: (chainId: number) => `/info/tokens/${chainId}`,
  QUOTE: "/sor/quote/v2",
  ASSEMBLE: "/sor/assemble",
}
export const API_IMAGE_URL = (symbol: string) =>
  `https://assets.odos.xyz/tokens/${symbol}.webp`

export function useOdos(chainId: number = 42161) {
  const tokenListQuery = useQuery({
    queryKey: ["odosTokenList", chainId],
    queryFn: async () => {
      const response = await fetch(API_URL + API_ROUTES.TOKEN_LIST(chainId))
      const data: any = await response.json()

      const tokenMap = data.tokenMap
      const addresses = Object.keys(tokenMap)
      const tokenInfo = addresses.map((address: string) => tokenMap[address])
      return tokenInfo.map((token: any, index: number) => ({
        address: addresses[index] as `0x${string}`,
        symbol: token.symbol,
        decimals: token.decimals,
        displayDecimals: token.decimals,
        priceDisplayDecimals: 2,
        mgvTestToken: false,
      }))
    },
    refetchInterval: 24 * 60 * 60 * 1000,
  })

  return {
    odosTokens: tokenListQuery.data ?? [],
    isLoading: tokenListQuery.isLoading,
    error: tokenListQuery.error,
  }
}
