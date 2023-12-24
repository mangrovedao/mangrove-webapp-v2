import { cn } from "@/utils"
import { AverageReturn } from "./components/average-return"
import { LiquiditySource } from "./components/liquidity-source"
import { RiskAppetite } from "./components/risk-appetite"

export function PriceRange({ className }: { className?: string }) {
  return (
    <div className={cn(className)}>
      <div className="border-b">
        <div className="flex justify-between items-center px-6 pb-8">
          <AverageReturn percentage={1.5} />
          <RiskAppetite value="low" />
          <LiquiditySource />
        </div>
      </div>
    </div>
  )
}
