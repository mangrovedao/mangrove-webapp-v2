import useMarket from "@/providers/market"
import { publicMarketActions } from "@mangrovedao/mgv"
import { usePublicClient } from "wagmi"
import { useMangroveAddresses } from "./use-addresses"

export function useMarketClient() {
  const publicClient = usePublicClient()
  const addresses = useMangroveAddresses()
  const { currentMarket } = useMarket()

  if (!publicClient?.key || !addresses || !currentMarket) return undefined
  return publicClient.extend(publicMarketActions(addresses, currentMarket))
}
