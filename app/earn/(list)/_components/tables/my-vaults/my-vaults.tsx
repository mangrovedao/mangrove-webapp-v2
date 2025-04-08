"use client"
import { useRouter } from "next/navigation"
import React from "react"

import { useVaultsWhitelist } from "@/app/earn/(shared)/_hooks/use-vaults-addresses"
import { Vault } from "@/app/earn/(shared)/types"
import CloseStrategyDialog from "@/app/strategies/[address]/_components/parameters/dialogs/close"
import { DataTable } from "@/components/ui/data-table-new/data-table"
import { useAccount } from "wagmi"
import { TableLoadingSkeleton } from "../tables"
import { useMyVaults } from "./hooks/use-my-vaults"
import { useTable } from "./hooks/use-table"

export function MyVaults() {
  const { push } = useRouter()
  const { chainId } = useAccount()
  const [{ page, pageSize }, setPageDetails] = React.useState<PageDetails>({
    page: 1,
    pageSize: 15, // Increased page size for better performance
  })

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

  const {
    data: vaults,
    isLoading,
    error,
    refetch,
  } = useMyVaults({
    filters: {
      skip: (page - 1) * pageSize,
      first: pageSize,
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
      push(`/earn/${vault.address}`)
    },
    isLoading,
  })

  // temporary fix
  React.useEffect(() => {
    refetch?.()
  }, [chainId, refetch])

  if (isLoading) return <TableLoadingSkeleton />

  return (
    <div className="relative overflow-hidden">
      <DataTable
        table={table}
        emptyArrayMessage="No positions yet."
        isError={!!error}
        onRowClick={(vault) => {
          if (vault) {
            push(`/earn/${vault.address}`)
          }
        }}
        cellClasses="font-ubuntu"
        tableRowClasses="font-ubuntu"
        pagination={{
          onPageChange: setPageDetails,
          page,
          pageSize,
          count,
        }}
        containerClassName="max-h-[600px]"
        skeletonRows={5}
      />
      <CloseStrategyDialog
        strategyAddress={closeStrategy?.address || ""}
        isOpen={!!closeStrategy}
        onClose={() => setCloseStrategy(undefined)}
      />
    </div>
  )
}
