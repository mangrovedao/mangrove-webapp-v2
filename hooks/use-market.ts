import { publicMarketActions } from "@mangrovedao/mgv"
import { Address } from "viem"
import { usePublicClient } from "wagmi"
import { useMangroveAddresses } from "./use-addresses"
import useMarket from "@/providers/market.new"

export type UseMarketClientParams = {}

export function useMarketClient(params?: UseMarketClientParams) {
  const publicClient = usePublicClient()
  const addresses = useMangroveAddresses()
  const { currentMarket } = useMarket()
  console.log("market", currentMarket)
  if (!publicClient || !addresses || !currentMarket) return undefined
  return publicClient.extend(publicMarketActions(addresses, currentMarket))
}
