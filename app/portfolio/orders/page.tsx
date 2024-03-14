"use client"

import {
  CustomTabs,
  CustomTabsContent,
  CustomTabsList,
  CustomTabsTrigger,
} from "@/components/custom-tabs"
import { DataTable } from "@/components/ui/data-table/data-table"
import { useTable } from "../_components/tables/open-orders/use-table"
import { useOrders } from "@/app/trade/_components/tables/orders/hooks/use-orders"

export default function Page() {
  const { data } = useOrders({
    select: (orders) => orders.length,
  })

  console.log("🚀 ~ Page ~ count:", data)
  // const table = useTable({
  //   data: [],
  // })

  return (
    <main className="w-full">
      <h1 className="p-4">Open Orders</h1>

      <CustomTabs defaultValue={"all"} className="h-full">
        <CustomTabsList className="w-full flex justify-start border-b">
          <CustomTabsTrigger value={"all"}>All</CustomTabsTrigger>
          <CustomTabsTrigger value={"limit"}>Limit</CustomTabsTrigger>
          <CustomTabsTrigger value={"amplified"}>Amplified</CustomTabsTrigger>
          <CustomTabsTrigger value={"stop"}>Stop</CustomTabsTrigger>
        </CustomTabsList>
        {/* <CustomTabsContent className="p-4" value="all">
          <DataTable table={table} />
        </CustomTabsContent>
        <CustomTabsContent className="p-4" value="limit">
          <DataTable table={table} />
        </CustomTabsContent>
        <CustomTabsContent className="p-4" value="amplified">
          <DataTable table={table} />
        </CustomTabsContent>
        <CustomTabsContent className="p-4" value="stop">
          <DataTable table={table} />
        </CustomTabsContent> */}
      </CustomTabs>
    </main>
  )
}
