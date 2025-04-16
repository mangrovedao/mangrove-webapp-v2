"use client"
import { cn } from "@/utils"
import { motion } from "framer-motion"

export function AnimatedOrderBookSkeleton() {
  // Number of rows to display in each section
  const rowCount = 8

  // Create arrays for asks and bids rows
  const asksRows = Array.from({ length: rowCount }, (_, i) => i)
  const bidsRows = Array.from({ length: rowCount }, (_, i) => i)

  return (
    <div className="w-full h-full flex flex-col">
      {/* Asks (Sell) Section */}
      <div className="flex-1 overflow-hidden">
        <div className="flex flex-col">
          {asksRows.map((i) => (
            <motion.div
              key={`ask-${i}`}
              className="flex justify-between px-4 py-1.5 border-b border-border-tertiary"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 0.7, y: 0 }}
              transition={{
                duration: 0.3,
                delay: 0.1 + i * 0.05,
                ease: "easeOut",
              }}
            >
              <motion.div
                className={cn("flex-1 h-4 rounded-sm", "bg-red-900/30")}
                animate={{
                  opacity: [0.3, 0.5, 0.3],
                  width: ["60%", "70%", "60%"],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut",
                  delay: i * 0.1,
                }}
              />
              <motion.div
                className="flex-1 h-4 mx-2 rounded-sm bg-bg-tertiary"
                animate={{
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut",
                  delay: i * 0.1 + 0.2,
                }}
              />
              <motion.div
                className="flex-1 h-4 rounded-sm bg-bg-tertiary"
                animate={{
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut",
                  delay: i * 0.1 + 0.4,
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Spread Section */}
      <motion.div
        className="flex justify-center items-center py-2 border-y border-border-tertiary bg-bg-secondary/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <motion.div
          className="h-5 w-24 bg-bg-tertiary rounded-md"
          animate={{
            opacity: [0.5, 0.8, 0.5],
            backgroundColor: ["#2a2a2a", "#333333", "#2a2a2a"],
          }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
            ease: "easeInOut",
          }}
        />
      </motion.div>

      {/* Bids (Buy) Section */}
      <div className="flex-1 overflow-hidden">
        <div className="flex flex-col">
          {bidsRows.map((i) => (
            <motion.div
              key={`bid-${i}`}
              className="flex justify-between px-4 py-1.5 border-b border-border-tertiary"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 0.7, y: 0 }}
              transition={{
                duration: 0.3,
                delay: 0.9 + i * 0.05,
                ease: "easeOut",
              }}
            >
              <motion.div
                className={cn("flex-1 h-4 rounded-sm", "bg-green-900/30")}
                animate={{
                  opacity: [0.3, 0.5, 0.3],
                  width: ["60%", "70%", "60%"],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut",
                  delay: i * 0.1,
                }}
              />
              <motion.div
                className="flex-1 h-4 mx-2 rounded-sm bg-bg-tertiary"
                animate={{
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut",
                  delay: i * 0.1 + 0.2,
                }}
              />
              <motion.div
                className="flex-1 h-4 rounded-sm bg-bg-tertiary"
                animate={{
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut",
                  delay: i * 0.1 + 0.4,
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
