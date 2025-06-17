"use client"
import { useRouter } from "next/navigation"
import React, { useMemo, useState } from "react"

import CloseStrategyDialog from "@/app/strategies/[address]/_components/parameters/dialogs/close"
import { DataTable } from "@/components/ui/data-table-new/data-table"
import type { Strategy } from "../../../_schemas/kandels"

import { Switch } from "@/components/ui/switch"
import { motion } from "framer-motion"
import { useTable } from "./hooks/use-table"
import { useVaults } from "./hooks/use-vaults-data"

type PageDetails = {
  page: number
  pageSize: number
}

export function Vaults() {
  const { push } = useRouter()
  const containerRef = React.useRef<HTMLDivElement>(null)

  // Use the custom hook for data fetching
  const { data: vaults, isLoading, error } = useVaults()

  const [showDeprecated, setShowDeprecated] = useState<boolean>(false)
  const [{ page, pageSize }, setPageDetails] = React.useState<PageDetails>({
    page: 1,
    pageSize: 15,
  })
  const [closeStrategy, setCloseStrategy] = React.useState<Strategy>()

  // Filter vaults based on deprecated toggle
  const filteredVaults = useMemo(() => {
    return showDeprecated
      ? vaults
      : vaults?.filter((vault) => !vault.isDeprecated)
  }, [vaults, showDeprecated])

  const table = useTable({
    pageSize,
    data: filteredVaults ?? [],
    onDeposit: (vault) => undefined,
    isLoading,
  })

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-red-500">Error loading vaults: {error.message}</p>
      </div>
    )
  }

  return (
    <div>
      {vaults?.length > 0 && (
        <div className="flex gap-2 items-center justify-end mr-2 my-3">
          <Switch
            checked={showDeprecated}
            onCheckedChange={setShowDeprecated}
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
            count: filteredVaults?.length,
          }}
          emptyArrayMessage={
            isLoading ? "Loading vaults..." : "No vaults available"
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
