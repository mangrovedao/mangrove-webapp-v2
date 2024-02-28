import { filterOpenMarketsWithMarketConfig } from "@/utils/whitelisted-markets"
import type Mangrove from "@mangrovedao/mangrove.js"

export async function getWhitelistedMarketsInfos(
  mangrove: Mangrove,
  chainId: number,
) {
  const openMarkets = await mangrove?.openMarkets()
  console.log(openMarkets)
  return filterOpenMarketsWithMarketConfig(openMarkets, chainId)
}
