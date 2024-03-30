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
        "w-full flex space-x-4 align-middle rounded-lg mt-2 p-2 relative bg-mango-300 ",
      )}
    >
      <button
        className="absolute top-3 right-2 hover:opacity-90 transition-opacity"
        onClick={() => setStrategyBannerWarning(true)}
      >
        <X className="text-cloud-300 w-5 h-5 hover:text-secondary" />
        <span className="sr-only">Close</span>
      </button>

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
            Liquidity is not locked in strategies, it stays in your wallet. If
            all funds are moved and there is no available liquidity to execute
            the matched offer- strategy offers will start failing and your
            strategy will become inactive.
          </Caption>
        </div>
      </div>
    </aside>
  )
}
