import { cn } from "@/utils"
import { motion } from "framer-motion"
import { useEffect, useRef, useState } from "react"

export default function TradingTabs({ tradeSide, setTradeSide }: any) {
  const [tabWidth, setTabWidth] = useState(0)
  const [tabLeft, setTabLeft] = useState(0)
  const buyTabRef = useRef<HTMLButtonElement>(null)
  const sellTabRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const activeTab =
      tradeSide === "buy" ? buyTabRef.current : sellTabRef.current
    if (activeTab) {
      setTabWidth(activeTab.offsetWidth)
      setTabLeft(activeTab.offsetLeft)
    }
  }, [tradeSide])

  return (
    <div className="flex flex-col w-full">
      {/* Buy/Sell Mode Tabs */}
      <div className="flex w-full mb-4 bg-[#1a1a1a] rounded-lg overflow-hidden relative">
        {/* Sliding indicator */}
        <motion.div
          className="absolute h-full bg-[#ff6b00]/10 rounded-lg z-0"
          initial={false}
          animate={{
            width: tabWidth,
            x: tabLeft,
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
          }}
        />

        <button
          ref={buyTabRef}
          onClick={() => setTradeSide("buy")}
          className={cn(
            "flex-1 py-3 text-center font-medium transition-colors relative z-10",
            tradeSide === "buy"
              ? "text-[#ff6b00]"
              : "text-gray-400 hover:text-gray-300",
          )}
        >
          Buy
        </button>
        <button
          ref={sellTabRef}
          onClick={() => setTradeSide("sell")}
          className={cn(
            "flex-1 py-3 text-center font-medium transition-colors relative z-10",
            tradeSide === "sell"
              ? "text-[#ff6b00]"
              : "text-gray-400 hover:text-gray-300",
          )}
        >
          Sell
        </button>
      </div>
    </div>
  )
}
