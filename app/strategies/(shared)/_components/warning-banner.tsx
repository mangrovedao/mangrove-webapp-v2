"use client"

import { Caption } from "@/components/typography/caption"
import useLocalStorage from "@/hooks/use-local-storage"
import { Info } from "@/svgs"
import { cn } from "@/utils"
import { X } from "lucide-react"

export default function WarningBanner() {
  const [strategyBannerWarning, setStrategyBannerWarning] = useLocalStorage<
    boolean | null
  >("strategyBannerWarning", null)

  if (strategyBannerWarning) return null
  return (
    <aside
      className={cn(
        "w-full flex justify-between  space-x-4 align-middle rounded-lg mt-2 p-2 bg-mango-300 ",
      )}
    >
      <div className="flex align-middle items-center space-x-2">
        <div
          className={cn(
            "h-8 aspect-square rounded-lg flex items-center justify-center text-red-100 p-1",
            {
              "bg-mango-300": true,
            },
          )}
        >
          <Info className={"text-mango-100"} />
        </div>
        <div>
          <Caption>
            Strategy liquidity stays in your wallet; removing it while having
            active offers will mark your strategy as inactive. Received
            liquidity may be on your strategy contract, you can withdraw it at
            anytime from Parameters tab.
          </Caption>
        </div>
      </div>
      <button
        className="top-3 right-2 hover:opacity-90 transition-opacity"
        onClick={() => setStrategyBannerWarning(true)}
      >
        <X className="text-cloud-300 w-5 h-5 hover:text-secondary" />
        <span className="sr-only">Close</span>
      </button>
    </aside>
  )
}
