"use client"

import {
  CustomTabs,
  CustomTabsContent,
  CustomTabsList,
  CustomTabsTrigger,
} from "@/components/custom-tabs"
import { DataTable } from "@/components/ui/data-table/data-table"
import { useTable } from "../_components/tables/history/orders/use-table"
import { useTable as useStrategiesTable } from "../_components/tables/history/strategies/use-table"
import { useFills } from "@/app/trade/_components/tables/fills/use-fills"
import { useState } from "react"
import HistoryDetailSheet from "../_components/history/history-detail-sheet"
import { useStrategies } from "@/app/strategies/(list)/_components/tables/strategies/hooks/use-strategies"
import { Fill } from "@/app/trade/_components/tables/fills/schema"
import { Strategy } from "@/app/strategies/(list)/_schemas/kandels"
import { useRouter } from "next/navigation"

export default function Page() {
  const [showSheet, setShowSheet] = useState(false)
  const [rowInfo, setRowInfo] = useState<Fill | null>(null)
  const [{ page, pageSize }, setPageDetails] = useState<PageDetails>({
    page: 1,
    pageSize: 10,
  })
  const fillsQuery = useFills({
    filters: {
      skip: (page - 1) * pageSize,
    },
  })
  const { push } = useRouter()

  const ordersTable = useTable({
    data: fillsQuery.data,
  })

  const { data } = useStrategies({
    filters: {
      skip: (page - 1) * pageSize,
    },
  })

  const strategiesTable = useStrategiesTable({
    data,
    onManage: (strategy: Strategy) => {
      push(`/strategies/${strategy.address}`)
    },
  })

  return (
    <main className="w-full">
      <h1 className="p-4">History</h1>

      <CustomTabs defaultValue={"trades"} className="h-full">
        <CustomTabsList className="w-full flex justify-start border-b">
          <CustomTabsTrigger value={"trades"}>Trades</CustomTabsTrigger>
          <CustomTabsTrigger value={"strategies"}>Strategies</CustomTabsTrigger>
        </CustomTabsList>
        <CustomTabsContent className="p-4" value="trades">
          <DataTable
            table={ordersTable}
            onRowClick={(row) => {
              setShowSheet(true)
              setRowInfo(row)
            }}
          />
          {showSheet && (
            <HistoryDetailSheet
              orderInfo={rowInfo}
              onClose={() => setShowSheet(false)}
            />
          )}
        </CustomTabsContent>
        <CustomTabsContent className="p-4" value="strategies">
          <DataTable table={strategiesTable} />
        </CustomTabsContent>
      </CustomTabs>
    </main>
  )
}
