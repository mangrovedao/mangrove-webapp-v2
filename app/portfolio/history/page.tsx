"use client"

import {
  CustomTabs,
  CustomTabsContent,
  CustomTabsList,
  CustomTabsTrigger,
} from "@/components/custom-tabs"
import { DataTable } from "@/components/ui/data-table/data-table"
import { useTable } from "../_components/tables/history/use-table"
import { useFills } from "@/app/trade/_components/tables/fills/use-fills"
import { useState } from "react"

export default function Page() {
  const [{ page, pageSize }, setPageDetails] = useState<PageDetails>({
    page: 1,
    pageSize: 10,
  })
  const fillsQuery = useFills({
    filters: {
      skip: (page - 1) * pageSize,
    },
  })

  const table = useTable({
    data: fillsQuery.data,
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
          <DataTable table={table} />
        </CustomTabsContent>
        <CustomTabsContent className="p-4" value="strategies">
          <DataTable table={table} />
        </CustomTabsContent>
      </CustomTabs>
    </main>
  )
}
