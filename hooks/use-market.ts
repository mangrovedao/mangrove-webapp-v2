import useMarket from "@/providers/market"
import { publicMarketActions } from "@mangrovedao/mgv"
import { useMangroveAddresses } from "./use-addresses"
import { useNetworkClient } from "./use-network-client"

export function useMarketClient() {
  const publicClient = useNetworkClient()
  const addresses = useMangroveAddresses()
  const { currentMarket } = useMarket()

  if (!publicClient?.key || !addresses || !currentMarket) return undefined
  return publicClient.extend(publicMarketActions(addresses, currentMarket))
}
