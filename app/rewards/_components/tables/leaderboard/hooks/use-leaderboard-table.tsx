"use client"

import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Value, ValueLeft } from "../components/value"
import { LeaderboardEntry } from "./use-leaderboard"

// Simple address formatter
const formatAddress = (address: string): string => {
  if (!address) return ""
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function useLeaderboardTable({
  pageSize,
  data,
  user,
}: {
  pageSize: number
  data?: LeaderboardEntry[]
  user?: string
}) {
  // Common header and cell classes for consistent alignment
  const rankClasses = "text-center w-full"
  const addressClasses = "text-left w-full"
  const rewardClasses = "w-full"

  const columns: ColumnDef<LeaderboardEntry>[] = [
    {
      accessorKey: "rank",
      header: () => <div className={rankClasses}>Rank</div>,
      cell: ({ row }) => (
        <div className={rankClasses}>{row.getValue("rank")}</div>
      ),
      size: 5,
    },
    {
      accessorKey: "address",
      header: () => <div className={addressClasses}>Address</div>,
      cell: ({ row }) => {
        const address = row.getValue("address") as string
        return (
          <div className={addressClasses}>
            <ValueLeft value={formatAddress(address)} />
          </div>
        )
      },
      size: 27,
    },
    {
      accessorKey: "volumeRewards",
      header: () => <div className={rewardClasses}>Volume Rewards</div>,
      cell: ({ row }) => (
        <div className={rewardClasses}>
          <Value value={`${row.original.formattedVolumeRewards} MGV`} />
        </div>
      ),
      size: 27,
    },
    {
      accessorKey: "vaultRewards",
      header: () => <div className={rewardClasses}>Vault Rewards</div>,
      cell: ({ row }) => (
        <div className={rewardClasses}>
          <Value value={`${row.original.formattedVaultRewards} MGV`} />
        </div>
      ),
      size: 27,
    },
    {
      accessorKey: "totalRewards",
      header: () => <div className={rewardClasses}>Total Rewards</div>,
      cell: ({ row }) => (
        <div className={rewardClasses}>
          <Value value={`${row.original.formattedTotalRewards} MGV`} />
        </div>
      ),
      size: 27,
    },
  ]

  const table = useReactTable({
    data: data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: Math.ceil((data?.length ?? 0) / pageSize),
  })

  return table
}
