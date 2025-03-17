import { cn } from "@/utils"
import { motion } from "framer-motion"
import { type TableCellProps } from "./types"

export function OrderBookTableHead({ children, className }: TableCellProps) {
  return (
    <motion.th
      className={cn(
        "py-1 px-3 text-xs text-left tracking-wider text-primary/80 transition-all duration-200 font-thin ",
        className,
      )}
      // initial={{ opacity: 0, y: -3 }}
      // animate={{ opacity: 1, y: 0 }}
      // transition={{ duration: 0.3 }}
    >
      {children}
    </motion.th>
  )
}
