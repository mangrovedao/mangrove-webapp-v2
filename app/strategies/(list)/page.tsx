"use client"

import { Title } from "@/components/typography/title"
import { Button } from "@/components/ui/button-old"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useMarkets } from "@/hooks/use-addresses"
import { getFeatureFlagConfig } from "@/schemas/feature-flag"
import { useRouter } from "next/navigation"
import React from "react"
import { InfoBanner } from "./_components/info-banner"
import { Tables } from "./_components/tables/tables"

export default function Page() {
  const router = useRouter()
  const markets = useMarkets()
  const featureFlagConfig = getFeatureFlagConfig()
  const [hideCreateStrat, setHideCreateStrat] = React.useState(false)
  function handleNext() {
    if (!markets[0]) return
    router.push(
      `/strategies/new?market=${markets[0].base.address},${markets[0].quote.address},${markets[0].tickSpacing}`,
      {
        scroll: false,
      },
    )
  }

  return (
    <main className="max-w-8xl mx-auto px-4 pt-8 overflow-x-hidden">
      <InfoBanner />
      <div className="mt-[56px] flex justify-between items-center">
        <Title>Strategies</Title>
        {featureFlagConfig?.strategy.create.enabled ? (
          <Button
            size={"lg"}
            rightIcon
            onClick={handleNext}
            suppressHydrationWarning
            disabled={hideCreateStrat}
          >
            Create strategy
          </Button>
        ) : (
          <TooltipProvider>
            <Tooltip delayDuration={200}>
              <TooltipTrigger className="hover:opacity-80 transition-opacity">
                <Button
                  size={"lg"}
                  rightIcon
                  suppressHydrationWarning
                  disabled={true}
                >
                  Create strategy
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {featureFlagConfig?.strategy.create.message}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <Tables hideCreateStrat={setHideCreateStrat} />
    </main>
  )
}
