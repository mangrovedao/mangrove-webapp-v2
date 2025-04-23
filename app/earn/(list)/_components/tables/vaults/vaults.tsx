"use client"
import { useRouter } from "next/navigation"
import React from "react"

import { Vault } from "@/app/earn/(shared)/types"
import CloseStrategyDialog from "@/app/strategies/[address]/_components/parameters/dialogs/close"
import { DataTable } from "@/components/ui/data-table-new/data-table"
import { Strategy } from "../../../_schemas/kandels"
import { useTable } from "./hooks/use-table"
import { useVaults } from "./hooks/use-vaults"

type VaultsProps = {
  showOnlyActive?: boolean
}

export function Vaults({ showOnlyActive = false }: VaultsProps) {
  const { push } = useRouter()
  const { vaults, count } = useVaults()

  const [{ page, pageSize }, setPageDetails] = React.useState<PageDetails>({
    page: 1,
    pageSize: 15, // Increase page size for virtualization
  })

  // // selected strategy to cancel
  const [closeStrategy, setCloseStrategy] = React.useState<Strategy>()

  const table = useTable({
    pageSize,
    data: vaults || [],
    onDeposit: (vault: Vault) => undefined,
    isLoading: false,
    defaultData: [],
  })

  return (
    <div className="overflow-hidden">
      <DataTable
        table={table}
        onRowClick={(vault) => {
          if (vault) {
            push(`/earn/${vault.address}`)
          }
        }}
        cellClasses="font-ubuntu text-lg"
        tableRowClasses="font-ubuntu"
        isLoading={!vaults}
        pagination={{
          onPageChange: setPageDetails,
          page,
          pageSize,
          count,
        }}
        emptyArrayMessage={
          showOnlyActive
            ? "No active vaults found. Try disabling the 'Active Vaults' filter."
            : false
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
