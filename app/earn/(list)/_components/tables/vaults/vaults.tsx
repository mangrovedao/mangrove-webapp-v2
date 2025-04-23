"use client"
import { useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"

import CloseStrategyDialog from "@/app/strategies/[address]/_components/parameters/dialogs/close"
import { DataTable } from "@/components/ui/data-table-new/data-table"
import { useAccount } from "wagmi"
import type { Strategy } from "../../../_schemas/kandels"

import { useVaultsWhitelist } from "@/app/earn/(shared)/_hooks/use-vaults-addresses"
import { Vault, VaultWhitelist } from "@/app/earn/(shared)/types"
import { Switch } from "@/components/ui/switch"
import { getIndexerUrl } from "@/utils/get-indexer-url"
import { Chain } from "viem"
import { useTable } from "./hooks/use-table"

export function Vaults() {
  const { push } = useRouter()
  const { chain } = useAccount()
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [data, setData] = useState<any>([])
  const [filteredData, setFilteredData] = useState<any>([])

  const plainVaults = useVaultsWhitelist()
  const [showDeprecated, setShowDeprecated] = useState<boolean>(false)

  const defaultData = plainVaults.map(
    (vault: VaultWhitelist) =>
      ({
        ...vault,
        symbol: "",
        incentivesApr: 0,
        apr: 0,
        decimals: 18,
        mintedAmount: 0n,
        managementFee: 0,
        totalRewards: 0,
        performanceFee: 0,
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
        deprecated: vault.isDeprecated,
        userBaseBalance: 0n,
        userQuoteBalance: 0n,
      }) as Vault,
  )

  useEffect(() => {
    const fetchVault = async (chain?: Chain) => {
      if (!chain) return

      const response = await fetch(
        `${getIndexerUrl(chain)}/vault/list/${chain.id}`,
      )
      const data = await response.json()

      let vaults = defaultData

      data.forEach((item: any) => {
        const vault = vaults.find(
          (vault) => vault.address.toLowerCase() === item.vault.toLowerCase(),
        )
        if (vault) {
          vault.tvl = item.tvl
          vault.apr = item.apr
        }
      })
      setData(vaults)
      const filtered = vaults.filter((vault) => vault.deprecated === false)
      setFilteredData(filtered)
    }

    fetchVault(chain)
  }, [chain])

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
      {data && (
        <div className="flex gap-2 items-center justify-end mr-2 my-3">
          <Switch
            checked={showDeprecated}
            onCheckedChange={() => setShowDeprecated?.(!showDeprecated)}
          />
          <span className="text-sm">Show Deprecated Vaults</span>
        </div>
      )}
      <div ref={containerRef} className="overflow-hidden">
        <DataTable
          table={table}
          onRowClick={(vault) => {
            if (vault) {
              push(`/earn/${vault.address}`)
            }
          }}
          cellClasses="font-ubuntu text-lg"
          tableRowClasses="font-ubuntu"
          pagination={{
            onPageChange: setPageDetails,
            page,
            pageSize,
            count: data.length,
          }}
          emptyArrayMessage={"Loading vaults..."}
          containerClassName="max-h-[600px]"
        />
        <CloseStrategyDialog
          strategyAddress={closeStrategy?.address || ""}
          isOpen={!!closeStrategy}
          onClose={() => setCloseStrategy(undefined)}
        />
      </div>
    </div>
  )
}
