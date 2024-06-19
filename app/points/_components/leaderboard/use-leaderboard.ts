"use client"

import { useQuery } from "@tanstack/react-query"
import { useAccount } from "wagmi"

import { getErrorMessage } from "@/utils/errors"
import { parseVolume } from "../../schemas/volume"

export function useUserVolume() {
  const { address } = useAccount()
  return useQuery({
    queryKey: ["user-volume", address],
    queryFn: async () => {
      try {
        if (!address) return null
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_MANGROVE_DATA_API_HOST}/volumes-per-pair/last-epoch-volume/${address}`,
        )
        const volume = await res.json()
        return parseVolume(volume)
      } catch (e) {
        console.error(getErrorMessage(e))
        throw new Error()
      }
    },
    meta: {
      error: "Unable to retrieve user volume data",
    },
    enabled: !!address,
    retry: false,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}
