"use client"
import { useRouter } from "next/navigation"
import React from "react"

import { useVaultWhiteList } from "@/app/earn/(shared)/_hooks/use-vault-whitelist"
import { useCurrentVaultsInfos } from "@/app/earn/(shared)/_hooks/use-vault.info"
import { CompleteVault } from "@/app/earn/(shared)/types"
import CloseStrategyDialog from "@/app/strategies/[address]/_components/parameters/dialogs/close"
import { DataTable } from "@/components/ui/data-table-new/data-table"
import { motion } from "framer-motion"
import { useAccount } from "wagmi"
import { TableLoadingSkeleton } from "../tables"
import { useTable } from "./hooks/use-table"

export function MyVaults() {
  const { push } = useRouter()
  const { chainId } = useAccount()
  const [{ page, pageSize }, setPageDetails] = React.useState<PageDetails>({
    page: 1,
    pageSize: 15, // Increased page size for better performance
  })

  const { data: vaults, isLoading, error, refetch } = useVaultWhiteList()
  const { data: vaultsInfos } = useCurrentVaultsInfos()

  const activeVaults = vaults?.filter((vault) =>
    vaultsInfos?.some(
      (vaultInfo) =>
        vaultInfo.userBalance > 0n &&
        vaultInfo.userQuoteBalance > 0n &&
        vaultInfo.vault === vault.address,
    ),
  )

  // selected strategy to cancel
  const [closeStrategy, setCloseStrategy] = React.useState<CompleteVault>()

  const table = useTable({
    pageSize,
    data: activeVaults,
    onManage: (vault: CompleteVault) => {
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative overflow-hidden"
    >
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
          count: vaults?.length ?? 0,
        }}
        containerClassName="max-h-[600px]"
        skeletonRows={5}
      />
      <CloseStrategyDialog
        strategyAddress={closeStrategy?.address || ""}
        isOpen={!!closeStrategy}
        onClose={() => setCloseStrategy(undefined)}
      />
    </motion.div>
  )
}
