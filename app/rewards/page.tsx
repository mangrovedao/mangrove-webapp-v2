"use client"

import Link from "next/link"
import { formatUnits } from "viem"

import {
  CustomTabs,
  CustomTabsContent,
  CustomTabsList,
  CustomTabsTrigger,
} from "@/components/custom-tabs"
import NeonContainer from "@/components/neon-container"
import { NumericValue } from "@/components/numeric-value"
import { Caption } from "@/components/typography/caption"
import { Title } from "@/components/typography/title"
import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { ToucanIllustration } from "@/svgs"
import { cn } from "@/utils"
import React from "react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select-new"
import { Ms1Table } from "./_components/tables/ms1/ms1-table"
import { Ms2Table } from "./_components/tables/ms2/ms2-table"
import Timer from "./_components/timer"
import { useRewards } from "./hooks/use-rewards"
import { useConfiguration } from "./hooks/use-rewards-config"

enum MSSortValues {
  MS2 = "MGV Incentives Program",
  MS1 = "Season 1 Points Program",
}

export default function Page() {
  const { data: configuration } = useConfiguration()
  const [tab, setTab] = React.useState("ms2-total-rewards")

  const { data: rewards } = useRewards({
    epochId:
      tab !== "ms1-leaderboard" && tab !== "ms2-total-rewards"
        ? tab
        : configuration?.epochId?.toString() || "1",
  })

  const [msSort, setMsSort] = React.useState(MSSortValues.MS2)

  const totalRewards =
    BigInt(rewards?.takerReward ?? 0n) +
    BigInt(rewards?.makerReward ?? 0n) +
    BigInt(rewards?.kandelRewards ?? 0n)

  return (
    <main className="mt-8 px-4">
      <div className="pl-5 grid">
        <Title variant={"header1"}>Rewards</Title>
        <Caption className="pl-0.5 text-text-secondary hover:underline !text-sm">
          <Link
            className="flex gap-1 items-center"
            href="https://docs.mangrove.exchange/mgv-incentives/introduction"
            target="_blank"
          >
            How are my rewards calculated?
          </Link>
        </Caption>
      </div>

      <div className="grid grid-cols-6 gap-10 mt-8">
        <div className="lg:col-span-4 col-span-6">
          <div className="rounded-2xl bg-gradient-to-t from-bg-primary to-bg-secondary p-5 flex items-center space-x-2 relative">
            <div className="absolute top-0 right-0 hidden sm:block md:-translate-x-1/2 -translate-y-2/3">
              <ToucanIllustration />
            </div>
            <Timer />
            <div>
              <h2 className="font-semibold text-2xl">
                Epoch #{configuration?.epochId}
              </h2>
              <div className="text-text-secondary text-xs flex space-x-4">
                <span>
                  Ends in{" "}
                  <span className="text-white">
                    {configuration?.timeRemaining || "..."}
                  </span>
                </span>
              </div>
            </div>
          </div>
          <div className="px-8">
            <hr className="px-6" />
          </div>
          <div className="px-4 md:px-16 py-5 flex">
            <div className="flex flex-col flex-1">
              <Label>Total Epoch Reward</Label>
              <Value className="flex-wrap text-wrap">
                <NumericValue value={formatUnits(totalRewards, 8)} />
              </Value>
            </div>
            <div className="flex flex-col flex-1 space-y-2">
              <div className="flex justify-between">
                <Label>Taker Rewards</Label>
                <Value size="small">
                  <NumericValue
                    value={formatUnits(BigInt(rewards?.takerReward ?? 0n), 8)}
                  />
                </Value>
              </div>
              <div className="flex justify-between">
                <Label>Maker Rewards</Label>
                <Value size="small">
                  <NumericValue
                    value={formatUnits(BigInt(rewards?.makerReward ?? 0n), 8)}
                  />
                </Value>
              </div>
              <div className="flex justify-between">
                <Label>Vault Rewards</Label>
                <Value size="small">
                  <NumericValue
                    value={formatUnits(BigInt(rewards?.kandelRewards ?? 0n), 8)}
                  />
                </Value>
              </div>
            </div>
          </div>

          <CustomTabs value={tab}>
            <ScrollArea className="h-full w-full" scrollHideDelay={200}>
              <CustomTabsList className="w-full flex justify-start border-b">
                <div key={`more-tab`} className="capitalize !text-primary">
                  <Select
                    value={msSort}
                    onValueChange={(value) => {
                      if (value === MSSortValues.MS1) {
                        setTab("ms1-leaderboard")
                        setMsSort(value as MSSortValues)
                      } else {
                        setTab("ms2-total-rewards")
                        setMsSort(value as MSSortValues)
                      }
                    }}
                    disabled={configuration?.epochEntries?.length === 0}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        suppressHydrationWarning
                        placeholder={"Select program"}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(MSSortValues).map((item, i) => (
                        <SelectItem value={item} key={`select-${item}-${i}`}>
                          <Title variant={"title1"} className="text-nowrap">
                            {item}
                          </Title>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {msSort === MSSortValues.MS2 ? (
                  <>
                    <CustomTabsTrigger
                      onClick={() => setTab("ms2-total-rewards")}
                      key={`ms2-total-rewards-tab`}
                      value={"ms2-total-rewards"}
                      id={`ms2-total-rewards-tab`}
                    >
                      Total rewards
                    </CustomTabsTrigger>
                    {configuration?.epochEntries
                      ?.toReversed()
                      .filter(
                        (entry) =>
                          entry.startTimestamp !== 0 &&
                          entry.startTimestamp < Math.floor(Date.now() / 1000),
                      )
                      ?.map((entry) => (
                        <CustomTabsTrigger
                          onClick={() => setTab(entry.epochId.toString())}
                          key={`${entry.epochId}-tab`}
                          value={entry.epochId.toString()}
                          id={`${entry.epochId}-tab`}
                          disabled={entry.startTimestamp > Date.now() / 1000}
                        >
                          Epoch {entry.epochId}
                        </CustomTabsTrigger>
                      ))}
                  </>
                ) : (
                  <CustomTabsTrigger
                    onClick={() => setTab("ms1-leaderboard")}
                    key={`ms1-leaderboard-tab`}
                    value={"ms1-leaderboard"}
                    className="capitalize"
                    id={`ms1-leaderboard-tab`}
                  >
                    Leaderboard
                  </CustomTabsTrigger>
                )}
              </CustomTabsList>
              <ScrollBar orientation="horizontal" className="z-50" />
            </ScrollArea>

            <div className="w-full pb-4 px-1 mt-3">
              {/* ms1 leaderboard */}
              <CustomTabsContent value={"ms1-leaderboard"}>
                <ScrollArea className="h-full" scrollHideDelay={200}>
                  <div className="px-2 h-full">
                    <Ms1Table />
                  </div>
                  <ScrollBar orientation="vertical" className="z-50" />
                  <ScrollBar orientation="horizontal" className="z-50" />
                </ScrollArea>
              </CustomTabsContent>

              {/* ms2 leaderboards */}
              <CustomTabsContent value={"ms2-total-rewards"}>
                <ScrollArea className="h-full" scrollHideDelay={200}>
                  <div className="px-2 h-full">
                    <Ms2Table />
                  </div>
                  <ScrollBar orientation="vertical" className="z-50" />
                  <ScrollBar orientation="horizontal" className="z-50" />
                </ScrollArea>
              </CustomTabsContent>

              {configuration?.epochEntries?.map((entry) => (
                <CustomTabsContent
                  key={`${entry.epochId}-content`}
                  value={entry.epochId.toString()}
                  // style={{ height: "var(--history-table-content-height)" }}
                >
                  <ScrollArea className="h-full" scrollHideDelay={200}>
                    <div className="px-2 h-full">
                      <Ms2Table epochId={entry.epochId} />
                    </div>
                    <ScrollBar orientation="vertical" className="z-50" />
                    <ScrollBar orientation="horizontal" className="z-50" />
                  </ScrollArea>
                </CustomTabsContent>
              ))}
            </div>
          </CustomTabs>
        </div>
        <div className="lg:col-span-2 col-span-6 h-20">
          <NeonContainer className="space-y-5">
            <div className="flex justify-between">
              <Label>Available rewards</Label>
              <Value>
                <NumericValue
                  value={formatUnits(
                    BigInt(rewards?.claimableRewards ?? 0n),
                    8,
                  )}
                />
              </Value>
            </div>

            <Button
              variant={"primary"}
              size={"xl"}
              className="w-full"
              disabled={true}
            >
              Claim rewards
            </Button>
          </NeonContainer>
          {/* <div className="flex justify-between my-5">
            <Label>Claimed rewards</Label>
            <Value>-</Value>
          </div>
          <div className="flex justify-between mt-5">
            <Label>Total rewards</Label>
            <Value>-</Value>
          </div> */}
        </div>
      </div>
    </main>
  )
}

function Label({ children }: React.ComponentProps<"span">) {
  return <span className="text-sm text-text-secondary">{children}</span>
}

function Value({
  children,
  size = "normal",
}: React.ComponentProps<"span"> & { size?: "small" | "normal" }) {
  return (
    <span
      className={cn({
        "text-2xl": size === "normal",
        "text-sm": size === "small",
      })}
    >
      {children} <span className="text-text-secondary">MGV</span>
    </span>
  )
}

/* 

box-sizing: border-box;

display: flex;
flex-direction: column;
justify-content: center;
align-items: flex-start;
padding: 20px;
gap: 20px;
isolation: isolate;

width: 376px;
height: 179px;

background: #0B1719;
box-shadow: 0px 0px 24px rgba(0, 203, 111, 0.4);
border-radius: 16px;

Inside auto layout
flex: none;
order: 0;
align-self: stretch;
flex-grow: 0;
 */
