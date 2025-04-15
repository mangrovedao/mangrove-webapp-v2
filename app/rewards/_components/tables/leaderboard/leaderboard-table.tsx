"use client"
import React, { useEffect, useRef } from "react"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table-new/data-table"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { useAccount } from "wagmi"
import { LeaderboardEntry, useLeaderboard } from "./hooks/use-leaderboard"
import { useLeaderboardTable } from "./hooks/use-leaderboard-table"

// Define the LeaderboardPage type for InfiniteData
interface LeaderboardPage {
  data: LeaderboardEntry[]
  meta: {
    hasNextPage: boolean
    page: number
  }
}

// Define type for what useLeaderboard returns after the select function
interface TransformedLeaderboardData {
  pages: LeaderboardPage[]
  pageParams: unknown[]
  flattened: LeaderboardEntry[]
}

interface LeaderboardTableProps {
  height?: string
}

export function LeaderboardTable({
  height = "500px", // Default fixed height
}: LeaderboardTableProps) {
  const { address: user, chainId, isConnected } = useAccount()
  const loadingRef = useRef<HTMLDivElement>(null)
  const pageSize = 10

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
  } = useLeaderboard({
    pageSize,
  })

  // Flatten data pages for the table
  const flatData = React.useMemo(() => {
    if (!data) return []
    return (data as unknown as TransformedLeaderboardData).flattened || []
  }, [data])

  // Refetch when chainId or user changes
  useEffect(() => {
    refetch?.()
  }, [chainId, user, refetch])

  // Setup intersection observer for infinite scrolling
  useEffect(() => {
    const loadingEl = loadingRef.current
    if (!loadingEl || !hasNextPage) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      {
        threshold: 0.5,
        rootMargin: "100px", // Reduced margin since we're in a scrollable container
      },
    )

    observer.observe(loadingEl)
    return () => observer.disconnect()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  const table = useLeaderboardTable({
    pageSize,
    data: flatData,
    user,
  })

  const emptyMessage = !isConnected
    ? "Connect your wallet to see your points"
    : "No rewards data yet."

  return (
    <div className="relative">
      <ScrollArea
        className="w-full overflow-hidden"
        style={{ height }}
        type="auto"
      >
        <div className="min-w-full">
          <DataTable
            table={table}
            emptyArrayMessage={emptyMessage}
            isError={!!error}
            isLoading={!data || isLoading}
            isRowHighlighted={(row) =>
              row.address.toLowerCase() === user?.toLowerCase()
            }
            rowHighlightedClasses={{
              row: "!text-inherit !font-inherit",
              inner: "!bg-opacity-30 !bg-[#1c3a40]",
            }}
            cellClasses="font-roboto"
            tableRowClasses="font-ubuntuLight"
          />

          {/* Loading indicator for infinite scrolling */}
          {(hasNextPage || isFetchingNextPage) && (
            <div
              ref={loadingRef}
              className="w-full h-12 flex items-center justify-center text-sm my-2"
            >
              {isFetchingNextPage ? (
                <div className="animate-pulse">Loading more rewards...</div>
              ) : (
                <Button
                  variant="secondary"
                  className="text-xs"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                >
                  Load more
                </Button>
              )}
            </div>
          )}
        </div>
        <ScrollBar orientation="vertical" className="z-50" />
        <ScrollBar orientation="horizontal" className="z-50" />
      </ScrollArea>
    </div>
  )
}
