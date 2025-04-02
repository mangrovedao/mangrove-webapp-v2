"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/utils"
import { AnimatePresence, motion } from "framer-motion"

interface TradeTabsProps {
  tabs: string[]
  activeTab: string
  onTabChange: (tab: string) => void
  className?: string
}

export function TradeTabs({
  tabs,
  activeTab,
  onTabChange,
  className,
}: TradeTabsProps) {
  const activeTabIndex = tabs.indexOf(activeTab)

  return (
    <div className={cn("flex relative", className)}>
      <AnimatePresence mode="popLayout">
        <div className="flex border border-bg-secondary w-full">
          {tabs.map((tab, index) => (
            <Button
              key={tab}
              variant="secondary"
              className={cn(
                "bg-transparent rounded-sm flex-1 border-0 px-6 py-2 text-sm font-medium transition-colors focus:outline-none relative overflow-hidden hover:bg-transparent",
                "max-sm:px-2 max-sm:py-1 max-sm:text-xs max-md:px-3 max-md:py-1.5",
                activeTab === tab
                  ? "text-white"
                  : "text-muted-foreground hover:text-white",
              )}
              onClick={() => onTabChange(tab)}
            >
              <span className="relative z-10 rounded-sm">{tab}</span>
              {activeTab === tab && (
                <motion.div
                  key={`background-${tab}`}
                  layoutId="active-tab-background"
                  className="absolute inset-0 bg-bg-secondary !rounded-sm"
                  initial={{
                    x: index > activeTabIndex ? "100%" : "-100%",
                    opacity: 0,
                  }}
                  animate={{
                    x: 0,
                    opacity: 1,
                  }}
                  exit={{
                    x: index > activeTabIndex ? "100%" : "-100%",
                    opacity: 0,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                  }}
                />
              )}
            </Button>
          ))}
        </div>
      </AnimatePresence>
    </div>
  )
}
