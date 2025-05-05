import type { Token } from "@mangrovedao/mgv"

import { getTokenByAddress } from "@/utils/tokens"
import { useOdos } from "./odos/use-odos"
import { useOpenMarkets } from "./use-open-markets"

export function useTokenByAddress(address: string): Token | undefined {
  const { openMarkets } = useOpenMarkets()
  const { odosTokens } = useOdos()
  return getTokenByAddress(address, openMarkets, odosTokens)
}
