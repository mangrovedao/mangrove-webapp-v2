"use client"
import { motion } from "framer-motion"

export function AnimatedFormsSkeleton() {
  return (
    <div className="w-full h-full flex flex-col  border border-bg-secondary rounded-sm">
      {/* Tabs Header */}
      <motion.div
        className="flex w-full border-b border-border-tertiary"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="w-1/2 h-10 flex items-center justify-center border-r border-border-tertiary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <motion.div
            className="h-4 w-12 bg-bg-tertiary rounded-md"
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
        </motion.div>
        <motion.div
          className="w-1/2 h-10 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <motion.div
            className="h-4 w-12 bg-bg-tertiary rounded-md"
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
      </motion.div>

      {/* Form Content */}
      <div className="p-4 flex-1 flex flex-col space-y-4">
        {/* Price Input */}
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <motion.div
            className="h-4 w-16 bg-bg-tertiary rounded-md"
            animate={{
              opacity: [0.5, 0.7, 0.5],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="h-10 w-full bg-bg-tertiary rounded-md"
            animate={{
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              repeat: Infinity,
              duration: 2,
              ease: "easeInOut",
              delay: 0.1,
            }}
          />
        </motion.div>

        {/* Amount Input */}
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <motion.div
            className="h-4 w-20 bg-bg-tertiary rounded-md"
            animate={{
              opacity: [0.5, 0.7, 0.5],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="h-10 w-full bg-bg-tertiary rounded-md"
            animate={{
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              repeat: Infinity,
              duration: 2,
              ease: "easeInOut",
              delay: 0.2,
            }}
          />
        </motion.div>

        {/* Sliders */}
        <motion.div
          className="space-y-3 py-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <motion.div
            className="h-2 w-full bg-bg-tertiary rounded-full"
            animate={{
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              repeat: Infinity,
              duration: 2,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="h-2 w-full bg-bg-tertiary rounded-full"
            animate={{
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              repeat: Infinity,
              duration: 2,
              ease: "easeInOut",
              delay: 0.3,
            }}
          />
        </motion.div>

        {/* Summary */}
        <motion.div
          className="space-y-2 py-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          <motion.div
            className="h-4 w-24 bg-bg-tertiary rounded-md"
            animate={{
              opacity: [0.5, 0.7, 0.5],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="h-16 w-full bg-bg-tertiary rounded-md"
            animate={{
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              repeat: Infinity,
              duration: 2,
              ease: "easeInOut",
              delay: 0.4,
            }}
          />
        </motion.div>

        {/* Action Button */}
        <motion.div
          className="mt-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.7 }}
        >
          <motion.div
            className="h-12 w-full bg-bg-tertiary rounded-md"
            animate={{
              opacity: [0.4, 0.6, 0.4],
              backgroundColor: ["#2a2a2a", "#333333", "#2a2a2a"],
            }}
            transition={{
              repeat: Infinity,
              duration: 2,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      </div>
    </div>
  )
}
