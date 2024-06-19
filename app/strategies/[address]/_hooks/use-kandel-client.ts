import { publicMarketActions } from "@mangrovedao/mgv"
import { usePublicClient } from "wagmi"

import { useMangroveAddresses } from "@/hooks/use-addresses"
import useKandelMarket from "./use-kandel-market"

export function useKandelClient() {
  const publicClient = usePublicClient()
  const addresses = useMangroveAddresses()
  const market = useKandelMarket()

  if (!publicClient || !addresses || !market) return undefined
  return publicClient.extend(publicMarketActions(addresses, market))
}
