"use client"

import { useVaultsWhitelist } from "@/app/earn/(shared)/_hooks/use-vaults-addresses"
import { useVaultsIncentives } from "@/app/earn/(shared)/_hooks/use-vaults-incentives"
import { getVaultIncentives } from "@/app/earn/(shared)/_service/vault-incentives"
import { getVaultsInformation } from "@/app/earn/(shared)/_service/vaults-infos"
import { useMgvFdv } from "@/app/earn/(shared)/store/vault-store"
import { Vault, VaultWhitelist } from "@/app/earn/(shared)/types"
import { useNetworkClient } from "@/hooks/use-network-client"
import { printEvmError } from "@/utils/errors"
import { useQuery } from "@tanstack/react-query"
import { PublicClient } from "viem"
import { useAccount } from "wagmi"

type Params<T> = {
  filters?: {
    first?: number
    skip?: number
  }
  select?: (data: (Vault | VaultWhitelist)[]) => T
  whitelist?: VaultWhitelist[]
}

export function useVaults<T = Vault[] | undefined>({
  filters: { first = 10, skip = 0 } = {},
  select,
}: Params<T> = {}) {
  const networkClient = useNetworkClient()
  const { address: user, chainId } = useAccount()
  const plainVaults = useVaultsWhitelist()
  const incentives = useVaultsIncentives()
  const { fdv } = useMgvFdv()

  const { data, ...rest } = useQuery({
    queryKey: [
      "vaults",
      networkClient?.key,
      fdv,
      user,
      chainId,
      plainVaults.length,
    ],
    queryFn: async (): Promise<Vault[]> => {
      try {
        if (!networkClient?.key) throw new Error("Public client is not enabled")
        if (!plainVaults) return []

        const incentivesData = await Promise.all(
          plainVaults.map(async (vault) => {
            const data = await getVaultIncentives(
              networkClient as PublicClient,
              incentives.find(
                (i) => i.vault.toLowerCase() === vault.address.toLowerCase(),
              ),
            )
            return {
              vault: vault.address,
              total:
                data?.leaderboard.reduce(
                  (sum, entry) => sum + entry.rewards,
                  0,
                ) ?? 0,
            }
          }),
        )

        const vaults = await getVaultsInformation(
          networkClient as PublicClient,
          plainVaults,
          user,
          incentives,
          fdv,
          incentivesData,
        )

        return vaults ?? []
      } catch (error) {
        printEvmError(error)
        return []
      }
    },
    enabled: !!networkClient && !!plainVaults.length,
  })
  return {
    data: (select ? select(data ?? []) : data) as unknown as T,
    ...rest,
  }
}
