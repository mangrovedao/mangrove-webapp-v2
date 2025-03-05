"use client"
import { cn } from "@/utils"
import { motion } from "framer-motion"

export function AnimatedTradesHistorySkeleton() {
  // Number of rows to display
  const rowCount = 15

  // Create array for trade rows
  const tradeRows = Array.from({ length: rowCount }, (_, i) => i)

  return (
    <div className="w-full h-full flex flex-col">
      {/* Table Header */}
      <motion.div
        className="flex justify-between px-4 py-2 border-b border-border-tertiary text-xs text-muted-foreground sticky top-0 bg-bg-secondary/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex-1">Price</div>
        <div className="flex-1 text-center">Size</div>
        <div className="flex-1 text-right">Time</div>
      </motion.div>

      {/* Trades Rows */}
      <div className="flex-1 overflow-hidden">
        <div className="flex flex-col">
          {tradeRows.map((i) => (
            <motion.div
              key={`trade-${i}`}
              className="flex justify-between px-4 py-1.5 border-b border-border-tertiary"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 0.7, x: 0 }}
              transition={{
                duration: 0.3,
                delay: 0.1 + i * 0.03,
                ease: "easeOut",
              }}
            >
              {/* Price column with random color (buy/sell) */}
              <motion.div
                className={cn(
                  "flex-1 h-4 rounded-sm",
                  i % 2 === 0 ? "bg-green-900/30" : "bg-red-900/30",
                )}
                animate={{
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut",
                  delay: i * 0.05,
                }}
              />

              {/* Size column */}
              <motion.div
                className="flex-1 h-4 mx-2 rounded-sm bg-bg-tertiary"
                animate={{
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut",
                  delay: i * 0.05 + 0.1,
                }}
              />

              {/* Time column */}
              <motion.div
                className="flex-1 h-4 rounded-sm bg-bg-tertiary"
                animate={{
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut",
                  delay: i * 0.05 + 0.2,
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
