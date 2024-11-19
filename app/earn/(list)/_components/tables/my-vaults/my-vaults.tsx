"use client"
import { useRouter } from "next/navigation"
import React from "react"

import { Vault } from "@/app/earn/(shared)/types"
import CloseStrategyDialog from "@/app/strategies/[address]/_components/parameters/dialogs/close"
import { DataTable } from "@/components/ui/data-table-new/data-table"
import { useAccount } from "wagmi"
import { useMyVaults } from "./hooks/use-my-vaults"
import { useTable } from "./hooks/use-table"

export function MyVaults() {
  const { push } = useRouter()
  const { chainId } = useAccount()
  const [{ page, pageSize }, setPageDetails] = React.useState<PageDetails>({
    page: 1,
    pageSize: 10,
  })

  const {
    data: vaults,
    isLoading,
    error,
    refetch,
  } = useMyVaults({
    filters: {
      skip: (page - 1) * pageSize,
    },
  })

  const { data: count } = useMyVaults({
    select: (vaults) => vaults.length,
  })

  // selected strategy to cancel
  const [closeStrategy, setCloseStrategy] = React.useState<Vault>()

  const table = useTable({
    pageSize,
    data: vaults,
    onManage: (vault: Vault) => {
      push(`/vault/${vault.address}`)
    },
  })

  // temporary fix
  React.useEffect(() => {
    refetch?.()
  }, [chainId])

  return (
    <>
      <DataTable
        table={table}
        emptyArrayMessage="No positions yet."
        isError={!!error}
        // isLoading={isLoading}
        onRowClick={(vault) =>
          // note: lost of context after redirecting with push method here
          // push(`/earn/${strategy?.address}`)
          (window.location.href = `/earn/${vault?.address}`)
        }
        cellClasses="font-ubuntu"
        tableRowClasses="font-ubuntu"
        pagination={{
          onPageChange: setPageDetails,
          page,
          pageSize,
          count,
        }}
      />
      <CloseStrategyDialog
        strategyAddress={closeStrategy?.address || ""}
        isOpen={!!closeStrategy}
        onClose={() => setCloseStrategy(undefined)}
      />
    </>
  )
}
