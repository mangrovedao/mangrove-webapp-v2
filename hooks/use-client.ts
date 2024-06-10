import { generalActions } from "@mangrovedao/mgv"
import { usePublicClient } from "wagmi"

export function useGeneralClient() {
  const publicClient = usePublicClient()
  if (!publicClient) return undefined
  return publicClient.extend(generalActions)
}
