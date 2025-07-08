"use client"

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"

export function AnimatedTradesHistorySkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <div className="mb-1.5 px-2 flex items-center justify-between">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-3 w-14" />
      </div>
      <ScrollArea className="h-[calc(100%-1.5rem)]" scrollHideDelay={200}>
        <div className="rounded-md border border-border-tertiary p-1">
          {/* Table Header */}
          <div className="flex justify-between mb-2 px-2 py-1 sticky top-0 bg-bg-secondary/90 backdrop-blur-sm z-10">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-3 w-14" />
          </div>

          {/* Table Rows */}
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
              className="flex justify-between items-center py-0.5 px-2 border-b border-border-tertiary last:border-0 hover:bg-muted/30 cursor-pointer transition-colors h-6"
            >
              {/* Type/Size Column */}
              <div className="flex flex-col gap-0">
                <Skeleton className="h-2 w-12" />
              </div>

              {/* Price Column */}
              <div className="flex flex-col gap-0">
                <Skeleton className="h-3 w-10" />
              </div>

              {/* Time Column */}
              <div className="flex flex-col gap-0">
                <Skeleton className="h-3 w-14" />
              </div>
            </motion.div>
          ))}
        </div>
        <ScrollBar orientation="vertical" className="z-50" />
      </ScrollArea>
    </motion.div>
  )
}
