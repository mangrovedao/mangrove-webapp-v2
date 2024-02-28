import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createZodFetcher } from "zod-fetch"

import { Address, Hex, TypedDataDomain, parseAbiParameter } from "viem"
import { useAccount, useChainId, useWalletClient } from "wagmi"
import { startPostResponseSchema, startedGetResponseSchema } from "./schema"

const fetchWithZod = createZodFetcher()

export function useDomain() {
  const chainId = useChainId()
  return {
    chainId,
    name: "MangroveReferral",
    verifyingContract: process.env.NEXT_PUBLIC_DOMAIN_ADDRESS as Address,
    version: "1.0.0",
  } satisfies TypedDataDomain
}

const refLinkAbi = parseAbiParameter([
  "struct RefLink { address owner; }",
  "RefLink",
])

const referralAbi = parseAbiParameter([
  "struct Referral { address referrer; address referee; }",
  "Referral",
])

export const types = {
  RefLink: refLinkAbi.components,
  Referral: referralAbi.components,
} as const

export function useSignReferral() {
  const { address } = useAccount()
  const { data: walletClient } = useWalletClient()
  const domain = useDomain()
  const { data } = useCanCreateReferralLink()

  return useMutation({
    mutationFn: async () => {
      if (!address || !walletClient || data?.success === false) return
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

export function useCanCreateReferralLink() {
  const { address } = useAccount()
  return useQuery({
    queryKey: ["can-create-referral-link", address],
    queryFn: async () => {
      const resp = await fetch(
        `${process.env.NEXT_PUBLIC_REFERRAL_SERVER_URL}/start/${address}`,
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

      return startedGetResponseSchema.parse(resp)
    },
    enabled: !!address,
  })
}

export function useCreateReferralLink() {
  const { address } = useAccount()
  const queryClient = useQueryClient()

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
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["can-create-referral-link", address],
      })
    },
    meta: {
      success: "Referral link created successfully",
      error: "Unable to create referral link",
    },
  })
}
