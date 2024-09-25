import type { Token } from "@mangrovedao/mgv"

import { useMarkets } from "@/hooks/use-addresses"
import { getTokenByAddress } from "@/utils/tokens"

export function useTokenByAddress(address: string): Token | undefined {
  const markets = useMarkets()
  return getTokenByAddress(address, markets)
}
