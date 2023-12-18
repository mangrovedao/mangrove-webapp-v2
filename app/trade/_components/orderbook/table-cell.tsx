import { TableCell } from "@/components/ui/table"
import { cn } from "@/utils"
import { type TableCellProps } from "./types"

export function OrderBookTableCell({ children, className }: TableCellProps) {
  return (
    <TableCell
      className={cn(
        "p-0 px-[13px] text-right font-roboto font-light",
        className,
      )}
    >
      {children}
    </TableCell>
  )
}
