export const ODOS_API_URL = "https://api.odos.xyz"

export const ODOS_API_ROUTES = {
  TOKEN_LIST: (chainId: number) => `/info/tokens/${chainId}`,
  QUOTE: "/sor/quote/v2",
  ASSEMBLE: "/sor/assemble",
  ROUTER_CONTRACT: (chainId: number) => `/info/router/v2/${chainId}`,
}

export const ODOS_API_IMAGE_URL = (symbol: string) =>
  `https://assets.odos.xyz/tokens/${symbol}.webp`
