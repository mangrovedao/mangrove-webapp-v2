"use client"
import { useRouter } from "next/navigation"
import React from "react"

import CloseStrategyDialog from "@/app/strategies/[address]/_components/parameters/dialogs/close"
import { DataTable } from "@/components/ui/data-table-new/data-table"
import useMarket from "@/providers/market"
import type { Strategy } from "../../../_schemas/kandels"
import { Vault } from "../../../_schemas/vaults"
import { useTable } from "./hooks/use-table"
import { useVaults } from "./hooks/use-vaults"

type Props = {
  type: "user" | "all"
}
export function Vaults({ type }: Props) {
  const { push } = useRouter()
  const [{ page, pageSize }, setPageDetails] = React.useState<PageDetails>({
    page: 1,
    pageSize: 10,
  })
  const { currentMarket: market } = useMarket()

  const { data, isLoading, error, refetch } = useVaults({
    filters: {
      skip: (page - 1) * pageSize,
    },
  })

  const { data: count } = useVaults({
    select: (strategies) => strategies.length,
  })

  // temporary fix
  React.useEffect(() => {
    refetch?.()
  }, [])

  // selected strategy to cancel
  const [closeStrategy, setCloseStrategy] = React.useState<Strategy>()

  const table = useTable({
    type,
    pageSize,
    data,
    onManage: (vault: Vault) => {
      push(`/earn/${vault.address}/edit`)
    },
    onDeposit: (vault: Vault) => undefined,
  })

  return (
    <>
      <DataTable
        table={table}
        isError={!!error}
        isLoading={isLoading || !market}
        onRowClick={
          (vault) => {
            if (vault) {
              push(`/earn?id=${vault.address}`)
            }
          }
          // note: lost of context after redirecting with push method here
          // push(`/strategies/${strategy?.address}`)
          // (window.location.href = `/strategies/${strategy?.address}`)
        }
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
