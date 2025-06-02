"use client"
import React, { useEffect, useRef } from "react"

import { DataTable } from "@/components/ui/data-table/data-table"
import { Switch } from "@/components/ui/switch"
import { useMarket } from "@mangroveui/trade"
import { AnimatedOrdersSkeleton } from "./animated-orders-skeleton"
import EditOrderSheet from "./components/edit-order-sheet"

import { useOrders } from "@mangroveui/trade"
import { Order } from "@mangroveui/trade/dist/schema/order"
import { useTable } from "./hooks/use-table"

type Params = {
  showAllMarkets?: boolean
  setShowAllMarkets?: (showAllMarkets: boolean) => void
}

export function Orders({ showAllMarkets = true, setShowAllMarkets }: Params) {
  const { currentMarket, setMarket, markets } = useMarket()
  const loadingRef = useRef<HTMLDivElement>(null)

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useOrders({
    type: "active",
    pageSize: 25,
    allMarkets: showAllMarkets,
  })


  // selected order to delete
  const [orderToDelete, setOrderToDelete] = React.useState<Order>()
  const [orderToEdit, setOrderToEdit] = React.useState<{
    order: Order
    mode: "view" | "edit"
  }>()

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
    onEdit: (order) => setOrderToEdit({ order, mode: "edit" }),
    onCancel: setOrderToDelete,
  })

  if (!data) {
    return <AnimatedOrdersSkeleton />
  }

  return (
    <>
      <div className="relative">
        <div className="flex gap-2 items-center justify-end mr-2">
          <Switch
            checked={showAllMarkets}
            onCheckedChange={() => setShowAllMarkets?.(!showAllMarkets)}
          />
          <span className="text-sm">All Markets</span>
        </div>

        <DataTable
          table={table}
          isError={isError}
          isLoading={isLoading && !data}
          emptyArrayMessage="No orders currently active"
          onRowClick={(order) => {
            setMarket(
              markets?.find(
                (m) =>
                  m.base.address.toLocaleLowerCase() ===
                  order?.market?.base?.address?.toLocaleLowerCase(),
              )!,
            )
          }}
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
            ) : null}
          </div>
        )}
      </div>

      <EditOrderSheet
        orderInfos={orderToEdit}
        market={{ currentMarket, setMarket, markets }}
        onClose={() => setOrderToEdit(undefined)}
      />
    </>
  )
}
