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
      className="h-full font-light"
    >
      <div className="mb-1 px-2 flex items-center justify-between">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-3 w-14" />
      </div>
      <div className="h-[calc(100%-1.5rem)] rounded-md border border-border-tertiary p-1">
        <div className="flex justify-between mb-2 px-2">
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-3 w-14" />
        </div>

        {Array.from({ length: 10 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.2,
              delay: i * 0.03,
              ease: "easeOut",
            }}
            className="flex justify-between items-center py-0.5 px-2 border-b border-border-tertiary last:border-0 h-6"
          >
            <div className="flex flex-col gap-0">
              <Skeleton className="h-2" style={{ width: getRandomWidth() }} />
              <Skeleton className="h-2 w-10" />
            </div>
            <div className="flex flex-col gap-0">
              <Skeleton className="h-2 w-12" />
              <Skeleton className="h-2 w-6" />
            </div>
            <div className="flex flex-col gap-0">
              <Skeleton className="h-2 w-10" />
              <Skeleton className="h-2 w-8" />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
