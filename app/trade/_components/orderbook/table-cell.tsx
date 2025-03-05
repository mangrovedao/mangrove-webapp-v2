import { TableCell } from "@/components/ui/table"
import { cn } from "@/utils"
import { type TableCellProps } from "./types"

export function OrderBookTableCell({ children, className }: TableCellProps) {
  return (
    <TableCell
      className={cn(
        "p-0 px-3 py-1 text-left font-mono font-light text-sm transition-all duration-200 hover:font-medium",
        className,
      )}
    >
      {children}
    </TableCell>
  )
}
