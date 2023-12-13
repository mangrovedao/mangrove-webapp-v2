import { TableHead } from "@/components/ui/table"
import { cn } from "@/utils"
import { type TableCellProps } from "./types"

export function OrderBookTableHead({ children, className }: TableCellProps) {
  return (
    <TableHead className={cn("p-0 px-[13px] text-right", className)}>
      {children}
    </TableHead>
  )
}
