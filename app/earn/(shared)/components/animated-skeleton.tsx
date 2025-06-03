"use client"

import { cn } from "@/utils"
import { motion } from "framer-motion"

interface AnimatedSkeletonProps {
  className?: string
  variant?: "default" | "circular" | "text" | "card" | "icon"
  shimmer?: boolean
  pulse?: boolean
  delay?: number
}

export const AnimatedSkeleton = ({
  className,
  variant = "default",
  shimmer = true,
  pulse = false,
  delay = 0,
}: AnimatedSkeletonProps) => {
  const baseClasses = "bg-bg-secondary/60 rounded-sm relative overflow-hidden"

  const variantClasses = {
    default: "h-4 w-full",
    circular: "rounded-full",
    text: "h-4 w-3/4",
    card: "h-20 w-full",
    icon: "h-7 w-7 rounded-sm",
  }

  const shimmerVariants = {
    initial: { x: "-100%" },
    animate: {
      x: "100%",
      transition: {
        repeat: Infinity,
        duration: 1.8,
        ease: "easeInOut",
        delay,
      },
    },
  }

  const pulseVariants = {
    initial: { opacity: 0.6 },
    animate: {
      opacity: [0.6, 1, 0.6],
      transition: {
        repeat: Infinity,
        duration: 2,
        ease: "easeInOut",
        delay,
      },
    },
  }

  const scaleVariants = {
    initial: {
      opacity: 0,
      scale: 0.95,
    },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut",
        delay,
      },
    },
  }

  return (
    <motion.div
      className={cn(baseClasses, variantClasses[variant], className)}
      variants={scaleVariants}
      initial="initial"
      animate="animate"
    >
      {shimmer && (
        <motion.div
          variants={shimmerVariants}
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
          }}
        />
      )}
      {pulse && (
        <motion.div
          variants={pulseVariants}
          className="absolute inset-0 bg-white/5"
        />
      )}
    </motion.div>
  )
}

export const SkeletonText = ({
  lines = 1,
  className,
  delay = 0,
}: {
  lines?: number
  className?: string
  delay?: number
}) => {
  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: delay,
      },
    },
  }

  const itemVariants = {
    initial: { opacity: 0, x: -20 },
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  }

  return (
    <motion.div
      className={cn("space-y-2", className)}
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      {Array.from({ length: lines }).map((_, i) => (
        <motion.div key={i} variants={itemVariants}>
          <AnimatedSkeleton
            variant="text"
            className={i === lines - 1 ? "w-1/2" : "w-full"}
            delay={i * 0.1}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}

export const SkeletonCard = ({
  className,
  hasHeader = true,
  hasFooter = false,
  delay = 0,
}: {
  className?: string
  hasHeader?: boolean
  hasFooter?: boolean
  delay?: number
}) => {
  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        delay,
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  }

  return (
    <motion.div
      className={cn("p-4 space-y-3", className)}
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      {hasHeader && (
        <motion.div variants={itemVariants}>
          <AnimatedSkeleton className="h-6 w-1/3" />
        </motion.div>
      )}

      <motion.div variants={itemVariants}>
        <AnimatedSkeleton variant="card" />
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-2">
        <SkeletonText lines={2} />
      </motion.div>

      {hasFooter && (
        <motion.div variants={itemVariants}>
          <AnimatedSkeleton className="h-8 w-24" />
        </motion.div>
      )}
    </motion.div>
  )
}

// Floating animation for special effects
export const FloatingDots = ({ count = 3 }: { count?: number }) => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {Array.from({ length: count }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 bg-primary/30 rounded-full"
        animate={{
          y: [0, -60, 0],
          x: [0, Math.sin(i * 2) * 30, 0],
          opacity: [0, 0.7, 0],
        }}
        transition={{
          duration: 4 + i * 0.5,
          repeat: Infinity,
          delay: i * 0.8,
          ease: "easeInOut",
        }}
        style={{
          left: `${15 + i * 25}%`,
          top: "80%",
        }}
      />
    ))}
  </div>
)
