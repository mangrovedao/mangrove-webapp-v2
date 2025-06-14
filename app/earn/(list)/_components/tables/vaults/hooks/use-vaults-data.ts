"use client"
import { useEffect, useState } from "react"
import { Address } from "viem"
import { usePublicClient } from "wagmi"

import { useVaultsList } from "@/app/earn/(shared)/_hooks/use-vaults-list"
import { kandelSchema } from "@/app/earn/(shared)/schemas"
import { CompleteVault } from "@/app/earn/(shared)/types"
import { createVault, VaultABI } from "@/app/earn/(shared)/utils"
import { useDefaultChain } from "@/hooks/use-default-chain"
import { getIndexerUrl } from "@/utils/get-indexer-url"

export function useVaultsData() {
  const { defaultChain } = useDefaultChain()
  const publicClient = usePublicClient()
  const { data: vaultList } = useVaultsList()

  const [vaults, setVaults] = useState<CompleteVault[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchApr = async (
    kandelAddress: Address,
    chainId: number,
  ): Promise<number> => {
    try {
      const response = await fetch(
        `https://api.mgvinfra.com/kandel/apr/${chainId}/${kandelAddress}`,
      )

      if (!response.ok) return 0

      const kandelData = await response.json()
      const parsedData = kandelSchema.parse(kandelData)
      const { mangroveKandelAPR, aaveAPR } = parsedData.apr

      return (mangroveKandelAPR + aaveAPR) * 100
    } catch (error) {
      console.warn(`Failed to fetch APR for kandel ${kandelAddress}:`, error)
      return 0
    }
  }

  useEffect(() => {
    const fetchVaults = async () => {
      if (!defaultChain || !publicClient || !vaultList) return

      setIsLoading(true)
      setError(null)

      try {
        // Fetch API data (optional)
        let backendDataMap = new Map()
        try {
          const response = await fetch(
            `${getIndexerUrl(defaultChain)}/vault/list/${defaultChain.id}`,
          )

          if (response.ok) {
            const backendData = await response.json()
            backendData.forEach((item: any) => {
              backendDataMap.set(item.vault.toLowerCase(), item)
            })
          } else {
            console.warn("API unavailable, using whitelist only")
          }
        } catch (apiError) {
          console.warn("API error, using whitelist only:", apiError)
        }

        // Fetch kandel addresses and APR data (optional)
        let kandelMap = new Map()
        let aprMap = new Map()

        try {
          const kandelContracts = vaultList.map((vault) => ({
            address: vault.address,
            abi: VaultABI,
            functionName: "kandel",
          }))

          const kandelResults = await publicClient.multicall({
            contracts: kandelContracts,
            allowFailure: true,
          })

          // Collect kandel addresses
          kandelResults.forEach((result, index) => {
            if (result.status === "success" && result.result) {
              const kandelAddress = result.result as Address
              kandelMap.set(
                vaultList[index]?.address.toLowerCase() ?? "vault-not-found",
                kandelAddress,
              )
            }
          })

          // Fetch APR data for valid kandel addresses
          const aprPromises = Array.from(kandelMap.entries()).map(
            async ([vaultAddress, kandelAddress]) => {
              const apr = await fetchApr(kandelAddress, defaultChain.id)
              return { vaultAddress, apr }
            },
          )

          const aprResults = await Promise.allSettled(aprPromises)
          aprResults.forEach((result) => {
            if (result.status === "fulfilled") {
              aprMap.set(result.value.vaultAddress, result.value.apr)
            }
          })
        } catch (blockchainError) {
          console.warn("Blockchain data fetch failed:", blockchainError)
        }

        // Transform whitelist to vault objects with all available data
        const vaultsData = vaultList.map((vault) => {
          const vaultKey = vault.address.toLowerCase()
          const backendData = backendDataMap.get(vaultKey)
          const kandelAddress = kandelMap.get(vaultKey)
          const apr = aprMap.get(vaultKey)

          return createVault(vault, backendData, kandelAddress, apr)
        })

        setVaults(vaultsData)
      } catch (error) {
        console.error("Failed to fetch vault data:", error)
        setError("Failed to load vault data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchVaults()
  }, [defaultChain, publicClient])

  return {
    vaults,
    isLoading,
    error,
  }
}
