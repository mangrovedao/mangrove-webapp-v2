"use client"
import React from "react"

import { DataTable } from "@/components/ui/data-table-new/data-table"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { useAccount } from "wagmi"
import { useMs2Points } from "./hooks/use-ms2-points"
import { useMs2Table } from "./hooks/use-ms2-table"

export function Ms2Table({ epochId }: { epochId?: number }) {
  const { address: user, chainId, isConnected } = useAccount()
  const [{ page, pageSize }, setPageDetails] = React.useState<PageDetails>({
    page: 1,
    pageSize: 10,
  })

  const { data, isLoading, error, refetch } = useMs2Points({
    filters: {
      skip: (page - 1) * pageSize,
      epochId,
    },
  })

  const { data: count } = useMs2Points({
    filters: {
      epochId,
    },
    select: (points) => points.length ?? 0,
  })

  React.useEffect(() => {
    refetch?.()
  }, [chainId, page, user])

  const table = useMs2Table({ pageSize, data, user })

  const emptyMessage = !isConnected
    ? "Connect your wallet to see your points"
    : "No rewards data yet."

  return (
    <>
      {/* <aside>
        <div className="flex align-middle items-center space-x-2 p-2">
          <div>
            <Caption className="text-base!">
              Description of ms2 rewards...
            </Caption>
          </div>
        </div>
      </aside> */}
      <ScrollArea className="h-full" scrollHideDelay={200}>
        <DataTable
          table={table}
          emptyArrayMessage={emptyMessage}
          isError={!!error}
          isLoading={!data || isLoading}
          isRowHighlighted={(row) =>
            row.address.toLowerCase() === user?.toLowerCase()
          }
          rowHighlightedClasses={{
            row: "text-white hover:opacity-80 transition-all",
            inner: "!bg-[#1c3a40]",
          }}
          cellClasses="font-roboto"
          tableRowClasses="font-ubuntuLight"
          pagination={{
            onPageChange: setPageDetails,
            page,
            pageSize,
            count,
          }}
        />
        <ScrollBar orientation="vertical" className="z-50" />
        <ScrollBar orientation="horizontal" className="z-50" />
      </ScrollArea>
    </>
  )
}
