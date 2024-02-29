import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"
import { Address, Hex } from "viem"
import { useAccount, useWalletClient } from "wagmi"
import { createZodFetcher } from "zod-fetch"

import { types, useDomain } from "../../services"
import { referGetResponseSchema, referPostResponseSchema } from "./schema"

const fetchWithZod = createZodFetcher()

export function useSignReferral() {
  const { address: referee } = useAccount()
  const params = useParams<{ referrer: Address }>()
  const { data: walletClient } = useWalletClient()
  const domain = useDomain()

  return useMutation({
    mutationFn: async () => {
      if (!referee || !walletClient || !params.referrer || !params.referrer)
        return

      return walletClient.signTypedData({
        domain,
        types,
        primaryType: "Referral",
        message: { referrer: params.referrer, referee },
      })
    },
    meta: {
      error: "Unable to sign referee",
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
    enabled: !!params?.referrer && !!referee,
  })
}

export function useRefer() {
  const { address: referee } = useAccount()
  const params = useParams<{ referrer: string }>()
  const queryClient = useQueryClient()
  const { push } = useRouter()

  return useMutation({
    mutationFn: async (signature: Hex) => {
      if (!referee || !signature || !params.referrer) return
      return fetchWithZod(
        referPostResponseSchema,
        `${process.env.NEXT_PUBLIC_REFERRAL_SERVER_URL}/refer`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: {
              referrer: params.referrer,
              referee,
            },
            signature,
          }),
        },
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["can-be-referred"],
      })
      push("/referrals")
    },
    meta: {
      success: "Referred successfully",
      error: "Unable to refer",
    },
  })
}
