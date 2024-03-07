"use client"

import {
  CustomTabs,
  CustomTabsContent,
  CustomTabsList,
  CustomTabsTrigger,
} from "@/components/custom-tabs"
import { DataTable } from "@/components/ui/data-table/data-table"
import { useTable } from "../_components/tables/history/use-table"

export default function Page() {
  const table = useTable({
    data: [],
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
