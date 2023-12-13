"use client"

import { DataTable } from "@/components/ui/data-table/data-table"
import useMarket from "@/providers/market"
import { dialogs } from "@/services/dialogs.service"
import { tradeService } from "../../../services/trade.service"
import { useOrders } from "./use-orders"
import { useRetractOrder } from "./use-retract-order"
import { useTable } from "./use-table"

export function Orders() {
  const { market } = useMarket()
  const ordersQuery = useOrders()
  const { mutate, isPending } = useRetractOrder()

  const table = useTable({
    data: ordersQuery.data,
    onEdit: () => {
      console.log("edit")
    },
    onRetract: (order) => {
      tradeService.openConfirmRetractOrder({
        onConfirm: () => {
          if (!market) return
          mutate(
            { order, market },
            {
              onSuccess: () => dialogs.close(),
            },
          )
        },
      })
      // if (!market) return
      // mutate({
      //   order,
      //   market,
      // })
    },
  })
  return (
    <DataTable
      table={table}
      isError={!!ordersQuery.error}
      isLoading={ordersQuery.isLoading || !market}
    />
  )
}
