"use client"

import { Title } from "@/components/typography/title"
import { Button } from "@/components/ui/button"
import { useWhitelistedMarketsInfos } from "@/hooks/use-whitelisted-markets-infos"
import useMangrove from "@/providers/mangrove"
import { getValue } from "@/utils/market"
import { useRouter } from "next/navigation"
import { InfoBanner } from "./_components/info-banner"
import { Tables } from "./_components/tables/tables"

export default function Page() {
  const router = useRouter()
  const { mangrove } = useMangrove()
  const marketsInfosQuery = useWhitelistedMarketsInfos(mangrove)

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
        <Button
          size={"lg"}
          rightIcon
          onClick={handleNext}
          suppressHydrationWarning
        >
          Create strategy
        </Button>
      </div>
      <Tables />
      {/* <NewStrategyDialog
        open={isNewDialogOpen}
        onClose={toggleIsNewDialogOpen}
      /> */}
    </main>
  )
}
