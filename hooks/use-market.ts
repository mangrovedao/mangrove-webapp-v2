import useMarket from "@/providers/market"
import { MarketParams, publicMarketActions } from "@mangrovedao/mgv"
import { useMangroveAddresses } from "./use-addresses"
import { useNetworkClient } from "./use-network-client"

type UseMarketClientParams = {
  market?: MarketParams
}

export function useMarketClient({ market }: UseMarketClientParams = {}) {
  const publicClient = useNetworkClient()
  const addresses = useMangroveAddresses()
  const { currentMarket } = useMarket()
  const defaultMarket = market ?? currentMarket

  if (!publicClient?.key || !addresses || !defaultMarket) return undefined
  return publicClient.extend(publicMarketActions(addresses, defaultMarket))
}
