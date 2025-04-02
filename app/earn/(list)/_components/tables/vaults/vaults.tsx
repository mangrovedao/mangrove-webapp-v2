"use client"
import { useRouter } from "next/navigation"
import React, { useMemo } from "react"

import CloseStrategyDialog from "@/app/strategies/[address]/_components/parameters/dialogs/close"
import { DataTable } from "@/components/ui/data-table-new/data-table"
import { useAccount } from "wagmi"
import type { Strategy } from "../../../_schemas/kandels"

import { Vault } from "@/app/earn/(shared)/types"
import { TableLoadingSkeleton } from "../tables"
import { useTable } from "./hooks/use-table"
import { useVaults } from "./hooks/use-vaults"

type VaultsProps = {
  showOnlyActive?: boolean
}

export function Vaults({ showOnlyActive = false }: VaultsProps) {
  const { push } = useRouter()
  const { chainId } = useAccount()
  const containerRef = React.useRef<HTMLDivElement>(null)

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
    data: filteredData,
    onDeposit: (vault: Vault) => undefined,
  })

  if (isLoading) return <TableLoadingSkeleton />

  return (
    <div ref={containerRef} className="overflow-hidden">
      <DataTable
        table={table}
        isError={!!error}
        isLoading={isLoading}
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
