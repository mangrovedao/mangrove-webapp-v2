"use client"
import { motion } from "framer-motion"

export function AnimatedChartSkeleton() {
  return (
    <div className="w-full h-full flex flex-col border border-bg-secondary rounded-sm overflow-hidden">
      {/* Chart Header */}
      <motion.div
        className="flex justify-between items-center px-4 py-2 border-b border-border-tertiary"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="flex items-center space-x-2"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <motion.div
            className="h-5 w-20 bg-bg-tertiary rounded-md"
            animate={{
              opacity: [0.5, 0.7, 0.5],
              backgroundColor: ["#2a2a2a", "#333333", "#2a2a2a"],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="h-5 w-10 bg-bg-tertiary rounded-md"
            animate={{
              opacity: [0.5, 0.7, 0.5],
              backgroundColor: ["#2a2a2a", "#333333", "#2a2a2a"],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: "easeInOut",
              delay: 0.2,
            }}
          />
        </motion.div>

        <motion.div
          className="flex items-center space-x-2"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <motion.div
            className="h-5 w-8 bg-bg-tertiary rounded-md"
            animate={{
              opacity: [0.5, 0.7, 0.5],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: "easeInOut",
              delay: 0.1,
            }}
          />
          <motion.div
            className="h-5 w-8 bg-bg-tertiary rounded-md"
            animate={{
              opacity: [0.5, 0.7, 0.5],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: "easeInOut",
              delay: 0.2,
            }}
          />
          <motion.div
            className="h-5 w-8 bg-bg-tertiary rounded-md"
            animate={{
              opacity: [0.5, 0.7, 0.5],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: "easeInOut",
              delay: 0.3,
            }}
          />
        </motion.div>
      </motion.div>

      {/* Chart Content */}
      <div className="flex-1 relative">
        {/* Price Scale */}
        <motion.div
          className="absolute right-0 top-0 bottom-0 w-12 flex flex-col justify-between py-4 px-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={`price-${i}`}
              className="h-4 w-8 bg-bg-tertiary rounded-sm"
              animate={{
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: "easeInOut",
                delay: i * 0.1,
              }}
            />
          ))}
        </motion.div>

        {/* Time Scale */}
        <motion.div
          className="absolute left-0 right-12 bottom-0 h-8 flex justify-between items-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={`time-${i}`}
              className="h-3 w-10 bg-bg-tertiary rounded-sm"
              animate={{
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: "easeInOut",
                delay: i * 0.1,
              }}
            />
          ))}
        </motion.div>

        {/* Chart Lines */}
        <motion.div
          className="absolute inset-8 bottom-12 right-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.5 }}
        >
          {/* Candlesticks */}
          <div className="flex items-end h-full w-full justify-between">
            {Array.from({ length: 20 }).map((_, i) => {
              const height = Math.random() * 60 + 20
              const isUp = Math.random() > 0.5
              const wickHeight = height + Math.random() * 20

              return (
                <motion.div
                  key={`candle-${i}`}
                  className="relative flex flex-col items-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 0.7, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 + i * 0.02 }}
                >
                  {/* Wick */}
                  <motion.div
                    className="absolute bottom-0 w-[1px] bg-bg-tertiary"
                    style={{ height: `${wickHeight}%` }}
                    animate={{
                      opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 3,
                      ease: "easeInOut",
                      delay: i * 0.1,
                    }}
                  />

                  {/* Candle body */}
                  <motion.div
                    className={`w-2 absolute bottom-0 ${isUp ? "bg-green-900/30" : "bg-red-900/30"}`}
                    style={{ height: `${height}%` }}
                    animate={{
                      opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 2,
                      ease: "easeInOut",
                      delay: i * 0.1,
                    }}
                  />
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>

      {/* Bottom Toolbar */}
      <motion.div
        className="h-10 border-t border-border-tertiary flex items-center justify-between px-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.8 }}
      >
        <motion.div
          className="flex space-x-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.9 }}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <motion.div
              key={`tool-${i}`}
              className="h-5 w-6 bg-bg-tertiary rounded-sm"
              animate={{
                opacity: [0.4, 0.6, 0.4],
              }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
                ease: "easeInOut",
                delay: i * 0.1,
              }}
            />
          ))}
        </motion.div>

        <motion.div
          className="flex space-x-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 1 }}
        >
          {Array.from({ length: 3 }).map((_, i) => (
            <motion.div
              key={`setting-${i}`}
              className="h-5 w-6 bg-bg-tertiary rounded-sm"
              animate={{
                opacity: [0.4, 0.6, 0.4],
              }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
                ease: "easeInOut",
                delay: i * 0.1,
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}
