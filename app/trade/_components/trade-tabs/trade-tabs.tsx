"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/utils"

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
  return (
    <div className={cn("flex border-b border-border-tertiary ", className)}>
      {tabs.map((tab) => (
        <Button
          key={tab}
          variant="secondary"
          className={cn(
            "bg-transparent rounded-sm flex-1 px-6 py-2 text-sm font-medium transition-colors focus:outline-none",
            activeTab === tab
              ? "text-white border-[0.5px] border-muted-foreground"
              : "text-muted-foreground hover:text-white",
          )}
          onClick={() => onTabChange(tab)}
        >
          {tab}
        </Button>
      ))}
    </div>
  )
}
