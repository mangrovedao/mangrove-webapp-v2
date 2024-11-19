"use client"
import { useRouter } from "next/navigation"
import React from "react"

import CloseStrategyDialog from "@/app/strategies/[address]/_components/parameters/dialogs/close"
import { DataTable } from "@/components/ui/data-table-new/data-table"
import { useAccount } from "wagmi"
import type { Strategy } from "../../../_schemas/kandels"

import { useVaultsWhitelist } from "@/app/earn/(shared)/_hooks/use-vaults-addresses"
import { Vault } from "@/app/earn/(shared)/types"
import { useTable } from "./hooks/use-table"
import { useVaults } from "./hooks/use-vaults"

export function Vaults() {
  const { push } = useRouter()
  const { chainId } = useAccount()

  const [{ page, pageSize }, setPageDetails] = React.useState<PageDetails>({
    page: 1,
    pageSize: 10,
  })

  const whitelist = useVaultsWhitelist()

  const { data, isLoading, error, refetch } = useVaults({
    filters: {
      skip: (page - 1) * pageSize,
    },
    whitelist,
  })

  const { data: count } = useVaults({
    select: (vaults) => vaults.length,
  })

  // temporary fix
  React.useEffect(() => {
    refetch?.()
  }, [chainId])

  // selected strategy to cancel
  const [closeStrategy, setCloseStrategy] = React.useState<Strategy>()

  const table = useTable({
    pageSize,
    data,
    whitelist,
    onDeposit: (vault: Vault) => undefined,
  })

  return (
    <>
      <DataTable
        table={table}
        isError={!!error}
        isLoading={isLoading}
        onRowClick={
          (vault) => {
            if (vault) {
              push(`/earn/${vault.address}`)
            }
          }
          // note: lost of context after redirecting with push method here
          // push(`/strategies/${strategy?.address}`)
          // (window.location.href = `/strategies/${strategy?.address}`)
        }
        cellClasses="font-ubuntu text-lg"
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
