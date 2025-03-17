import { motion } from "framer-motion"

export function AnimatedOrdersSkeleton() {
  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <motion.div
        className="sticky top-0 z-10 bg-bg-primary p-2 border-b border-border"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="h-8 flex items-center justify-between">
          <motion.div
            className="h-5 w-24 bg-bg-secondary rounded-md"
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
          <motion.div
            className="h-5 w-32 bg-bg-secondary rounded-md"
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
          />
        </div>
      </motion.div>

      {/* Table Header */}
      <motion.div
        className="flex items-center p-2 border-b border-border text-xs font-medium text-text-secondary"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="w-1/6">Market</div>
        <div className="w-1/6">Side</div>
        <div className="w-1/6">Price</div>
        <div className="w-1/6">Size</div>
        <div className="w-1/6">Filled</div>
        <div className="w-1/6">Status</div>
      </motion.div>

      {/* Order Rows */}
      <div className="flex-1 overflow-auto">
        {Array.from({ length: 10 }).map((_, i) => (
          <motion.div
            key={i}
            className="flex items-center p-2 border-b border-border text-xs"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 * i }}
          >
            <motion.div
              className="w-1/6"
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ repeat: Infinity, duration: 2, delay: 0.1 * i }}
            >
              <div className="h-4 bg-bg-secondary rounded-md w-16" />
            </motion.div>
            <motion.div
              className="w-1/6"
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ repeat: Infinity, duration: 2, delay: 0.15 * i }}
            >
              <div
                className={`h-4 ${i % 2 === 0 ? "bg-green-caribbean" : "bg-red-500"} bg-opacity-30 rounded-md w-12`}
              />
            </motion.div>
            <motion.div
              className="w-1/6"
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ repeat: Infinity, duration: 2, delay: 0.2 * i }}
            >
              <div className="h-4 bg-bg-secondary rounded-md w-20" />
            </motion.div>
            <motion.div
              className="w-1/6"
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ repeat: Infinity, duration: 2, delay: 0.25 * i }}
            >
              <div className="h-4 bg-bg-secondary rounded-md w-14" />
            </motion.div>
            <motion.div
              className="w-1/6"
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ repeat: Infinity, duration: 2, delay: 0.3 * i }}
            >
              <div className="h-4 bg-bg-secondary rounded-md w-10" />
            </motion.div>
            <motion.div
              className="w-1/6"
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ repeat: Infinity, duration: 2, delay: 0.35 * i }}
            >
              <div className="h-4 bg-bg-secondary rounded-md w-16" />
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
