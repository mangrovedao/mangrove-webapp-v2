import { useMutation, useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import { Hex } from "viem"
import { useAccount, useWalletClient } from "wagmi"
import { createZodFetcher } from "zod-fetch"

import { types, useDomain } from "../../services"
import { referGetResponseSchema, startPostResponseSchema } from "./schema"

const fetchWithZod = createZodFetcher()

export function useSignReferral() {
  const { address } = useAccount()
  const { data: walletClient } = useWalletClient()
  const domain = useDomain()
  const { data } = useCanBeReferred()

  return useMutation({
    mutationFn: async () => {
      if (!address || !walletClient) return
      return walletClient.signTypedData({
        domain,
        types,
        primaryType: "RefLink",
        message: { owner: address },
      })
    },
    meta: {
      error: "Unable to sign referral",
    },
  })
}

export function useCanBeReferred() {
  const { address: referee } = useAccount()
  const params = useParams<{ referrer: string }>()
  return useQuery({
    queryKey: ["can-be-referred", referee],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_REFERRAL_SERVER_URL}/refer/${params.referrer}/${referee}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      ).then((response) => {
        if (response.status === 200 || response.status === 400) {
          return response.json()
        }
      })

      return referGetResponseSchema.parse(response)
    },
    enabled: !!params?.referrer,
  })
}

export function useCreateReferralLink() {
  const { address } = useAccount()

  return useMutation({
    mutationFn: async (signature: Hex) => {
      if (!address || !signature) return
      return fetchWithZod(
        startPostResponseSchema,
        `${process.env.NEXT_PUBLIC_REFERRAL_SERVER_URL}/start`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: {
              owner: address,
            },
            signature,
          }),
        },
      )
    },
    meta: {
      error: "Unable to create referral link",
    },
  })
}
