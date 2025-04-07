"use client"
import { useRouter } from "next/navigation"
import React, { useMemo } from "react"

import CloseStrategyDialog from "@/app/strategies/[address]/_components/parameters/dialogs/close"
import { DataTable } from "@/components/ui/data-table-new/data-table"
import { useAccount } from "wagmi"
import type { Strategy } from "../../../_schemas/kandels"

import { useVaultsWhitelist } from "@/app/earn/(shared)/_hooks/use-vaults-addresses"
import { Vault } from "@/app/earn/(shared)/types"
import { useTable } from "./hooks/use-table"
import { useVaults } from "./hooks/use-vaults"

type VaultsProps = {
  showOnlyActive?: boolean
}

export function Vaults({ showOnlyActive = false }: VaultsProps) {
  const { push } = useRouter()
  const { chainId } = useAccount()
  const containerRef = React.useRef<HTMLDivElement>(null)
  const plainVaults = useVaultsWhitelist()

  const defaultData = plainVaults.map(
    (vault) =>
      ({
        ...vault,
        // Required fields from Vault type
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
        userBaseBalance: 0n,
        userQuoteBalance: 0n,
      }) as Vault,
  )

  const [{ page, pageSize }, setPageDetails] = React.useState<PageDetails>({
    page: 1,
    pageSize: 15, // Increase page size for virtualization
  })

  const { data, isLoading, error, refetch } = useVaults({
    filters: {
      skip: (page - 1) * pageSize,
      first: pageSize,
    },
  })

  // Apply active vaults filter if needed
  const filteredData = useMemo(() => {
    if (!data) return []
    return showOnlyActive ? data.filter((vault) => vault.isActive) : data
  }, [data, showOnlyActive])

  const { data: count } = useVaults({
    select: (vaults) => vaults.length,
  })

  // temporary fix
  React.useEffect(() => {
    refetch?.()
  }, [chainId, refetch])

  // selected strategy to cancel
  const [closeStrategy, setCloseStrategy] = React.useState<Strategy>()

  const table = useTable({
    pageSize,
    // If data is loading but empty, provide an array of empty objects to render skeleton rows
    data: isLoading && filteredData.length === 0 ? defaultData : filteredData,
    onDeposit: (vault: Vault) => undefined,
    // Pass isLoading to the table so it can render loading skeletons only for TVL and APR
    isLoading,
    defaultData,
  })

  return (
    <div ref={containerRef} className="overflow-hidden">
      <DataTable
        table={table}
        isError={!!error}
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
          count,
        }}
        emptyArrayMessage={
          showOnlyActive
            ? "No active vaults found. Try disabling the 'Active Vaults' filter."
            : isLoading
              ? "Loading vaults..."
              : "No vaults available right now."
        }
        containerClassName="max-h-[600px]"
      />
      <CloseStrategyDialog
        strategyAddress={closeStrategy?.address || ""}
        isOpen={!!closeStrategy}
        onClose={() => setCloseStrategy(undefined)}
      />
    </div>
  )
}
