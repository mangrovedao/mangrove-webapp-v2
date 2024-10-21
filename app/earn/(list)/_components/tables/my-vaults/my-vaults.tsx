"use client"
import { useRouter } from "next/navigation"
import React from "react"

import { useVaultsWhitelist } from "@/app/earn/(shared)/_hooks/use-vaults-addresses"
import { Vault } from "@/app/earn/(shared)/types"
import CloseStrategyDialog from "@/app/strategies/[address]/_components/parameters/dialogs/close"
import { DataTable } from "@/components/ui/data-table-new/data-table"
import useMarket from "@/providers/market"
import { useTable } from "./hooks/use-table"

type Props = {
  type: "user" | "all"
}
export function MyVaults({ type }: Props) {
  const { push } = useRouter()
  const [{ page, pageSize }, setPageDetails] = React.useState<PageDetails>({
    page: 1,
    pageSize: 10,
  })

  const { currentMarket: market, markets } = useMarket()
  const vaults = useVaultsWhitelist()

  // selected strategy to cancel
  const [closeStrategy, setCloseStrategy] = React.useState<Vault>()

  const table = useTable({
    type,
    pageSize,
    data: [],
    onManage: (vault: Vault) => {
      push(`/vault/${vault.address}`)
    },
  })

  return (
    <>
      <DataTable
        table={table}
        emptyArrayMessage="No positions yet."
        isError={!!vaults}
        isLoading={!vaults || !market}
        // onRowClick={(earn) =>
        //   // note: lost of context after redirecting with push method here
        //   // push(`/earn/${strategy?.address}`)
        //   (window.location.href = `/earn/${strategy?.address}`)
        // }
        pagination={{
          onPageChange: setPageDetails,
          page,
          pageSize,
          count: vaults?.length,
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
