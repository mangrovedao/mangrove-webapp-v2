import { useOrders } from "./use-orders"

export function Orders() {
  const orders = useOrders()
  return <div>Orders</div>
}
