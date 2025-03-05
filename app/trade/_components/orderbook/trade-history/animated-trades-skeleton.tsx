"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"

export function AnimatedTradesHistorySkeleton() {
  // Generate random widths for skeletons
  const getRandomWidth = () => `${8 + Math.floor(Math.random() * 8)}px`

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <div className="mb-2 px-2 flex items-center justify-between">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="h-[calc(100%-2rem)] rounded-md border border-border-tertiary p-2">
        <div className="flex justify-between mb-4 px-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>

        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              delay: i * 0.05,
              ease: "easeOut",
            }}
            className="flex justify-between items-center py-2 px-2 border-b border-border-tertiary last:border-0"
          >
            <div className="flex flex-col gap-1">
              <Skeleton className="h-3" style={{ width: getRandomWidth() }} />
              <Skeleton className="h-3 w-12" />
            </div>
            <div className="flex flex-col gap-1">
              <Skeleton className="h-3 w-14" />
              <Skeleton className="h-3 w-8" />
            </div>
            <div className="flex flex-col gap-1">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-10" />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
