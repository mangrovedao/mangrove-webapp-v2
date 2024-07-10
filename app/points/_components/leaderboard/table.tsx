"use client"

import {
  CustomTabs,
  CustomTabsContent,
  CustomTabsList,
  CustomTabsTrigger,
} from "@/components/custom-tabs"
import InfoTooltip from "@/components/info-tooltip"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { cn } from "@/utils"
import { format } from "date-fns"
import { useAccount } from "wagmi"
import TotalContent from "./total-content"
import { useEpochs } from "./use-epochs"
import useScrollToRight from "./use-scroll-to-right"

export function Leaderboard() {
  const epochsQuery = useEpochs()
  const { address } = useAccount()
  const { scrollAreaRef } = useScrollToRight()

  const epochLength = epochsQuery.data?.length ?? 0
  const ms1Start = epochsQuery.data?.[0]?.real.start
  const ms1End = epochsQuery.data?.[epochLength - 1]?.real.end
  const formattedMs1Interval =
    ms1Start && ms1End
      ? `${format(new Date(ms1Start), "MMMM d")} to ${format(
          new Date(ms1End),
          "MMMM d",
        )}`
      : undefined

  return (
    <div className="mt-16 !text-white">
      <CustomTabs defaultValue={"ms1"} className={cn("h-full mb-10")}>
        <ScrollArea className="h-20" scrollHideDelay={200} ref={scrollAreaRef}>
          <CustomTabsList className="w-full flex justify-start border-b">
            <CustomTabsTrigger value={"ms1"} className="capitalize">
              MS1
              {formattedMs1Interval ? (
                <InfoTooltip className="ml-0">
                  {formattedMs1Interval}
                </InfoTooltip>
              ) : null}
            </CustomTabsTrigger>
          </CustomTabsList>
          <ScrollBar orientation="horizontal" className="z-50" />
        </ScrollArea>
        <CustomTabsContent value="ms1">
          <TotalContent account={address?.toLowerCase()} />
        </CustomTabsContent>
      </CustomTabs>
    </div>
  )
}
