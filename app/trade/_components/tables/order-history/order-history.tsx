"use client"

import React, { useEffect, useRef } from "react"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useOrders } from "../(shared)/use-orders"
import { DataTable } from "../../../../../components/ui/data-table/data-table"
import { useTable } from "./use-table"

type Params = {
  showAllMarkets?: boolean
  setShowAllMarkets?: (showAllMarkets: boolean) => void
}

export function OrderHistory({
  showAllMarkets = true,
  setShowAllMarkets,
}: Params) {
  const loadingRef = useRef<HTMLDivElement>(null)

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useOrders({
    type: "history",
    pageSize: 25,
    allMarkets: showAllMarkets,
  })

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
        rootMargin: "200px", // Load more data when within 200px of the bottom
      },
    )

    observer.observe(loadingEl)
    return () => observer.disconnect()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  // Flatten data pages for the table
  const flatData = React.useMemo(() => {
    if (!data?.pages) return []
    return data.pages.flatMap((page) => page.data)
  }, [data])

  const table = useTable({
    data: flatData,
    showMarketInfo: showAllMarkets,
  })

  if (isLoading && !data) {
    return (
      <div className="h-48 flex items-center justify-center">
        Loading order history...
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="flex gap-2 items-center justify-end mr-2">
        <Switch
          checked={showAllMarkets}
          onCheckedChange={() => setShowAllMarkets?.(!showAllMarkets)}
        />
        <span className="text-sm">All Markets</span>
      </div>

      {/* Encapsulate the DataTable and loading indicator in a div */}
      <div className="relative">
        <DataTable
          emptyArrayMessage="No trade history"
          table={table}
          isError={isError}
          isLoading={isLoading && !data}
          animated={true}
          animationVariant="slide"
        />

        {/* Loading indicator for infinite scrolling */}
        {(hasNextPage || isFetchingNextPage) && (
          <div
            ref={loadingRef}
            className="w-full h-12 flex items-center justify-center text-sm mt-2"
          >
            {isFetchingNextPage ? (
              <div className="animate-pulse">Loading more records...</div>
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
    </div>
  )
}
