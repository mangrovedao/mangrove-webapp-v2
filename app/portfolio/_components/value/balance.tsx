"use client"

import InfoTooltip from "@/components/info-tooltip"
import { DataTable } from "@/components/ui/data-table/data-table"
import { useTable } from "../tables/balance/use-table"

export default function Balance() {
  const table = useTable({
    data: [],
  })

  return (
    <div className="px-6 space-y-2">
      <div className="flex items-center">
        Balance
        <InfoTooltip className="pb-0.5">
          Balance of available assets (on Mangrove) in your wallet.
        </InfoTooltip>
      </div>
      <DataTable
        table={table}
        // isError={!!ordersQuery.error}
        // isLoading={ordersQuery.isLoading || !market}
        // onRowClick={(order) =>
        //   setOrderToEdit({ order: order as Order, mode: "view" })
        // }
        // pagination={{
        //   onPageChange: setPageDetails,
        //   page,
        //   pageSize,
        //   count,
        // }}
      />
    </div>
  )
}
