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
import EpochContent from "./epoch-content"
import TotalContent from "./total-content"
import { useEpochs } from "./use-epochs"
import useScrollToRight from "./use-scroll-to-right"

export function Leaderboard() {
  const epochsQuery = useEpochs()
  const { address } = useAccount()
  const { scrollAreaRef } = useScrollToRight()

  return (
    <div className="mt-16 !text-white">
      <CustomTabs defaultValue={"total"} className={cn("h-full mb-10")}>
        <ScrollArea className="h-20" scrollHideDelay={200} ref={scrollAreaRef}>
          <CustomTabsList className="w-full flex justify-start border-b">
            {epochsQuery.data
              ?.filter((x) => x.finished)
              .map((epoch) => (
                <CustomTabsTrigger
                  key={epoch.name}
                  value={epoch.name}
                  className="capitalize"
                >
                  {epoch.name}{" "}
                  <InfoTooltip className="ml-0">
                    {format(new Date(epoch.real.start), "MMMM d")} to{" "}
                    {format(new Date(epoch.real.end), "MMMM d")}
                  </InfoTooltip>
                </CustomTabsTrigger>
              ))}
            <CustomTabsTrigger value={"total"} className="capitalize">
              Total
              <InfoTooltip className="ml-0">February 28 to today</InfoTooltip>
            </CustomTabsTrigger>
          </CustomTabsList>
          <ScrollBar orientation="horizontal" className="z-50" />
        </ScrollArea>

        {epochsQuery.data
          ?.filter((x) => x.finished)
          .map((epoch) => (
            <CustomTabsContent value={epoch.name} key={epoch.name}>
              <EpochContent
                name={epoch.name}
                account={address?.toLowerCase()}
              />
            </CustomTabsContent>
          ))}
        <CustomTabsContent value="total">
          <TotalContent account={address?.toLowerCase()} />
        </CustomTabsContent>
      </CustomTabs>
    </div>
  )
}
