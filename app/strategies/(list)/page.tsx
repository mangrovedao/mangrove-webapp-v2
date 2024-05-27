"use client"

import { Title } from "@/components/typography/title"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useWhitelistedMarketsInfos } from "@/hooks/use-whitelisted-markets-infos"
import useMangrove from "@/providers/mangrove"
import { getFeatureFlagConfig } from "@/schemas/feature-flag"
import { getValue } from "@/utils/market"
import { useRouter } from "next/navigation"
import { InfoBanner } from "./_components/info-banner"
import { Tables } from "./_components/tables/tables"

export default function Page() {
  const router = useRouter()
  const { mangrove } = useMangrove()
  const marketsInfosQuery = useWhitelistedMarketsInfos(mangrove)
  const featureFlagConfig = getFeatureFlagConfig()
  console.log("featureFlagConfig", featureFlagConfig)

  function handleNext() {
    if (!marketsInfosQuery?.data?.[0]) return
    router.push(
      `/strategies/new?market=${getValue(marketsInfosQuery?.data?.[0])}`,
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
      <Tables />
      {/* <NewStrategyDialog
        open={isNewDialogOpen}
        onClose={toggleIsNewDialogOpen}
      /> */}
    </main>
  )
}
