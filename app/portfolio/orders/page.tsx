"use client"

import { useOrders } from "@/app/trade/_components/tables/orders/hooks/use-orders"
import { Order } from "@/app/trade/_components/tables/orders/schema"
import {
  CustomTabs,
  CustomTabsContent,
  CustomTabsList,
  CustomTabsTrigger,
} from "@/components/custom-tabs"
import { DataTable } from "@/components/ui/data-table/data-table"
import { useState } from "react"
import { useTable } from "../_components/tables/open-orders/use-table"
import EditOrderSheet from "@/app/trade/_components/tables/orders/components/edit-order-sheet"
import CancelOfferDialog from "@/app/trade/_components/tables/orders/components/cancel-offer-dialog"
import useMarket from "@/providers/market"
import { useAmplifiedOrders } from "@/app/trade/_components/tables/orders/hooks/use-amplified-orders"
import { useAmplifiedTable } from "@/app/trade/_components/tables/orders/hooks/use-amplified-table"

export default function Page() {
  const [{ page, pageSize }, setPageDetails] = useState<PageDetails>({
    page: 1,
    pageSize: 10,
  })
  const ordersQuery = useOrders({
    filters: {
      skip: (page - 1) * pageSize,
    },
  })
  const [orderToDelete, setOrderToDelete] = useState<Order>()
  const [orderToEdit, setOrderToEdit] = useState<{
    order: Order
    mode: "view" | "edit"
  }>()
  const { market } = useMarket()

  const table = useTable({
    data: ordersQuery.data,
    onEdit: (order) => setOrderToEdit({ order, mode: "edit" }),
    onCancel: setOrderToDelete,
  })

  const { data: amplifedOrders } = useAmplifiedOrders()

  const amplifiedTable = useAmplifiedTable({
    data: amplifedOrders,
    onEdit: () => {},
    onCancel: () => {},
  })

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
        <CustomTabsContent className="p-4" value="all">
          <DataTable
            table={table}
            isError={!!ordersQuery.error}
            isLoading={ordersQuery.isLoading}
            pagination={{
              onPageChange: setPageDetails,
              page,
              pageSize,
              count: ordersQuery.data?.length ?? 0,
            }}
          />
          <EditOrderSheet
            orderInfos={orderToEdit}
            market={market}
            onClose={() => setOrderToEdit(undefined)}
          />
          <CancelOfferDialog
            order={orderToDelete}
            market={market}
            onClose={() => setOrderToDelete(undefined)}
          />
        </CustomTabsContent>
        {/* <CustomTabsContent className="p-4" value="limit">
          <DataTable table={amplifiedTable} />
        </CustomTabsContent> */}
        <CustomTabsContent className="p-4" value="amplified">
          <DataTable table={amplifiedTable} />
        </CustomTabsContent>
        {/* <CustomTabsContent className="p-4" value="stop">
          <DataTable table={table} />
        </CustomTabsContent> */}
      </CustomTabs>
    </main>
  )
}
