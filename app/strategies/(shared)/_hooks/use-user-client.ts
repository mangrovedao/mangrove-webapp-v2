import { mangroveActions } from "@mangrovedao/mgv"
import { useClient } from "wagmi"

import { useMangroveAddresses } from "@/hooks/use-addresses"

export default function useUserClient() {
  const client = useClient()
  const addresses = useMangroveAddresses()

  try {
    if (!client || !addresses) return null
    const mangroveClient = client.extend(mangroveActions(addresses))

    return mangroveClient
  } catch (error) {
    console.error(error)
    throw new Error("failed to fetch mangrove client")
  }
}
