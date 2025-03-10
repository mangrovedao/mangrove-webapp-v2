import { cn } from "@/utils"
import { motion } from "framer-motion"
import { type TableCellProps } from "./types"

export function OrderBookTableHead({ children, className }: TableCellProps) {
  return (
    <motion.th
      className={cn(
        "p-2 px-3 text-left font-sans tracking-wider text-primary/80 transition-all duration-200",
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
