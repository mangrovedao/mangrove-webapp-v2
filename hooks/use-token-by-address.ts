import type { Token } from "@mangrovedao/mgv"

import { useMarkets } from "@/hooks/use-addresses"
import { getTokenByAddress } from "@/utils/tokens"
import { useOdos } from "./odos/use-odos"

export function useTokenByAddress(address: string): Token | undefined {
  const markets = useMarkets()
  const { odosTokens } = useOdos()
  return getTokenByAddress(address, markets, odosTokens)
}
