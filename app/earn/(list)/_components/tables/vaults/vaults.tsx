"use client"
import { useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"

import CloseStrategyDialog from "@/app/strategies/[address]/_components/parameters/dialogs/close"
import { DataTable } from "@/components/ui/data-table-new/data-table"
import type { Strategy } from "../../../_schemas/kandels"

import { useVaultsWhitelist } from "@/app/earn/(shared)/_hooks/use-vaults-addresses"
import { kandelSchema } from "@/app/earn/(shared)/schemas"
import { Vault } from "@/app/earn/(shared)/types"
import { VaultABI } from "@/app/earn/(shared)/utils"
import { Switch } from "@/components/ui/switch"
import { useDefaultChain } from "@/hooks/use-default-chain"
import { getIndexerUrl } from "@/utils/get-indexer-url"
import { motion } from "framer-motion"
import { Chain, type Address } from "viem"
import { usePublicClient } from "wagmi"
import { useTable } from "./hooks/use-table"

type PageDetails = {
  page: number
  pageSize: number
}

export function Vaults() {
  const { push } = useRouter()
  const { defaultChain: chain } = useDefaultChain()
  const publicClient = usePublicClient()
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [data, setData] = useState<any>([])
  const [filteredData, setFilteredData] = useState<any>([])

  const plainVaults = useVaultsWhitelist()
  const [showDeprecated, setShowDeprecated] = useState<boolean>(false)

  const defaultData = plainVaults.map(
    (vault) =>
      ({
        symbol: "",
        incentivesApr: 0,
        apr: 0,
        decimals: 18,
        mintedAmount: 0n,
        managementFee: 0,
        totalRewards: 0,
        performanceFee: 0,
        address: vault.address,
        market: vault.market,
        totalBase: 0n,
        totalQuote: 0n,
        balanceBase: 0n,
        balanceQuote: 0n,
        tvl: 0n,
        baseDollarPrice: 0,
        quoteDollarPrice: 0,
        strategist: vault.manager || "",
        type: vault.strategyType || "",
        isActive: true,
        deprecated: (vault as any).isDeprecated ?? false,
        userBaseBalance: 0n,
        userQuoteBalance: 0n,
        kandel: "0x0000000000000000000000000000000000000000",
      }) as Vault,
  )

  // Function to get APR from kandel address
  const getApr = async (kandelAddress: Address, chainId: number) => {
    try {
      const apiAPR = await fetch(
        `https://api.mgvinfra.com/kandel/apr/${chainId}/${kandelAddress}`,
      )

      if (!apiAPR.ok) {
        console.warn(`Failed to fetch APR for kandel ${kandelAddress}`)
        return { apr: 0 }
      }

      const kandelData = await apiAPR.json()
      const parsedKandelData = kandelSchema.parse(kandelData)
      const { mangroveKandelAPR, aaveAPR } = parsedKandelData.apr
      const apr = mangroveKandelAPR + aaveAPR

      return { apr }
    } catch (error) {
      console.error(`Error fetching APR for kandel ${kandelAddress}:`, error)
      return { apr: 0 }
    }
  }

  useEffect(() => {
    const fetchVault = async (chain?: Chain) => {
      if (!chain || !publicClient) return

      try {
        // First, fetch basic vault data from indexer
        const response = await fetch(
          `${getIndexerUrl(chain)}/vault/list/${chain.id}`,
        )
        const indexerData = await response.json()

        let vaults = [...defaultData]

        // Update vaults with indexer data
        indexerData.forEach((item: any) => {
          const vault = vaults.find(
            (vault) => vault.address.toLowerCase() === item.vault.toLowerCase(),
          )
          if (vault) {
            vault.tvl = item.tvl
            vault.apr = item.apr
          }
        })

        // Now fetch kandel addresses and APR data
        const kandelContracts = vaults.map((vault) => ({
          address: vault.address,
          abi: VaultABI,
          functionName: "kandel",
        }))

        // Get kandel addresses via multicall
        const kandelResults = await publicClient.multicall({
          contracts: kandelContracts,
          allowFailure: true,
        })

        // Fetch APR data for each kandel address
        const aprPromises = kandelResults.map(async (result, index) => {
          if (result.status === "success" && result.result && vaults[index]) {
            const kandelAddress = result.result as Address
            vaults[index]!.kandel = kandelAddress

            // Fetch APR data from backend API
            const aprData = await getApr(kandelAddress, chain.id)
            return { index, apr: aprData.apr, kandelAddress }
          }
          return {
            index,
            apr: 0,
            kandelAddress:
              "0x0000000000000000000000000000000000000000" as Address,
          }
        })

        // Wait for all APR requests to complete
        const aprResults = await Promise.allSettled(aprPromises)

        // Update vaults with APR data
        aprResults.forEach((result, index) => {
          if (result.status === "fulfilled" && vaults[index]) {
            const { apr, kandelAddress } = result.value
            vaults[index]!.apr = apr
            vaults[index]!.kandel = kandelAddress
          }
        })

        setData(vaults)
        const filtered = vaults.filter((vault) => vault.deprecated === false)
        setFilteredData(filtered)
      } catch (error) {
        console.error(
          "Failed to fetch vault data:",
          error,
          "fallback to ->",
          plainVaults,
        )
        // Fallback to default data from whitelist
        setData(defaultData)
        setFilteredData(
          defaultData.filter((vault) => vault.deprecated === false),
        )
      }
    }

    fetchVault(chain)
  }, [chain, publicClient])

  const [{ page, pageSize }, setPageDetails] = React.useState<PageDetails>({
    page: 1,
    pageSize: 15, // Increase page size for virtualization
  })

  // selected strategy to cancel
  const [closeStrategy, setCloseStrategy] = React.useState<Strategy>()

  const table = useTable({
    pageSize,
    // If data is loading but empty, provide an array of empty objects to render skeleton rows
    data: showDeprecated ? data : filteredData,
    onDeposit: (vault: Vault) => undefined,
    // Pass isLoading to the table so it can render loading skeletons only for TVL and APR
    isLoading: !data || !data.length,
    defaultData,
  })

  return (
    <div>
      {data?.length > 0 && (
        <div className="flex gap-2 items-center justify-end mr-2 my-3">
          <Switch
            checked={showDeprecated}
            onCheckedChange={() => setShowDeprecated?.(!showDeprecated)}
          />
          <span className="text-sm">Show Deprecated Vaults</span>
        </div>
      )}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        key={`deprecated-${showDeprecated}`}
        ref={containerRef}
        className="overflow-hidden"
      >
        <DataTable
          table={table}
          onRowClick={(vault) => {
            if (vault) {
              push(`/earn/${vault.address}`)
            }
          }}
          cellClasses="font-ubuntu text-lg"
          tableRowClasses="font-ubuntu hover:!text-black-rich"
          pagination={{
            onPageChange: setPageDetails,
            page,
            pageSize,
            count: data.length,
          }}
          emptyArrayMessage={
            !chain ? "Please connect your wallet" : "Loading vaults..."
          }
          containerClassName="max-h-[600px]"
        />
        <CloseStrategyDialog
          strategyAddress={closeStrategy?.address || ""}
          isOpen={!!closeStrategy}
          onClose={() => setCloseStrategy(undefined)}
        />
      </motion.div>
    </div>
  )
}
