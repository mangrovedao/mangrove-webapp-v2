"use client"

import Link from "next/link"
import { formatUnits } from "viem"

import {
  CustomTabs,
  CustomTabsContent,
  CustomTabsList,
  CustomTabsTrigger,
} from "@/components/custom-tabs"
import { NumericValue } from "@/components/numeric-value"
import { Caption } from "@/components/typography/caption"
import { Title } from "@/components/typography/title"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { MangroveLogo, ToucanIllustration } from "@/svgs"
import { cn } from "@/utils"
import React from "react"

import { Ms1Table } from "./_components/tables/ms1/ms1-table"
import { Ms2Table } from "./_components/tables/ms2/ms2-table"
import Timer from "./_components/timer"
import { useIncentivesRewards } from "./hooks/use-incentives-rewards"
import { useRewards } from "./hooks/use-rewards"
import { useConfiguration } from "./hooks/use-rewards-config"

enum MSSortValues {
  MS2 = "MGV Incentives Program",
  MS1 = "MS1",
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

  const { data: incentivesRewards } = useIncentivesRewards()

  const [msSort, setMsSort] = React.useState(MSSortValues.MS2)

  const totalRewards =
    BigInt(rewards?.takerReward ?? 0) +
    BigInt(rewards?.makerReward ?? 0) +
    BigInt(rewards?.vaultRewards ?? 0)

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
        <div className="col-span-full">
          <div className="rounded-sm bg-gradient-to-t from-bg-primary to-bg-secondary p-5 flex items-center space-x-2 relative">
            <div className="absolute top-0 right-0 hidden sm:block md:-translate-x-1/2 -translate-y-2/3">
              <ToucanIllustration />
            </div>
            <Timer />
            <div>
              <h2 className="font-semibold text-2xl">
                Epoch #{configuration?.epochId}
              </h2>
              <div className="text-text-secondary text-xs flex space-x-4">
                <span>Ended</span>
              </div>
            </div>
          </div>
          {/* <div className="px-8">
            <hr className="px-6" />
          </div> */}
          <div className="px-4 py-5 flex gap-4 items-center justify-between relative">
            <div className="flex flex-col">
              <Label>Total Epoch Reward</Label>
              <Value className="flex-wrap text-wrap">
                <NumericValue value={formatUnits(totalRewards, 8)} />
              </Value>
              <div className="flex flex-col flex-1 mt-2">
                <Label>Vaults LP Rewards</Label>
                <Value className="flex-wrap text-wrap">
                  <NumericValue
                    value={incentivesRewards?.toFixed(6) || "0.00"}
                  />
                </Value>
              </div>
            </div>
            <div className="absolute inset-0 w-full overflow-hidden opacity-80 flex items-center justify-center">
              {/* Falling Mangrove Logos */}
              <div className="falling-container relative w-full h-full">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className={`falling-logo falling-logo-${(i % 6) + 1} absolute`}
                  >
                    <MangroveLogo className="drop-shadow-[0_0_5px_rgba(0,223,129,0.6)] opacity-10" />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex flex-col flex-1 mt-2">
                <Label>Taker Rewards</Label>
                <Value size="small">
                  <NumericValue
                    value={formatUnits(BigInt(rewards?.takerReward ?? 0), 8)}
                  />
                </Value>
              </div>
              <div className="flex flex-col flex-1 mt-2">
                <Label>Maker Rewards</Label>
                <Value size="small">
                  <NumericValue
                    value={formatUnits(BigInt(rewards?.makerReward ?? 0), 8)}
                  />
                </Value>
              </div>
              <div className="flex flex-col flex-1 mt-2">
                <Label>Vault Rewards</Label>
                <Value size="small">
                  <NumericValue
                    value={formatUnits(BigInt(rewards?.vaultRewards ?? 0), 8)}
                  />
                </Value>
              </div>
            </div>
          </div>

          {/* <div className="rounded-2xl bg-gradient-to-t from-bg-primary to-bg-secondary p-5 flex items-center space-x-2 justify-between ">
            <div className="flex items-center gap-2">
              <ImageWithHideOnError
                src={`/assets/illustrations/mangrove-logo.png`}
                width={34}
                height={36}
                key={`mangrove-logo`}
                alt={`mangrove-logo`}
              />
              <Title variant={"title1"}>Vault LP rewards</Title>
            </div>

            <div className="flex items-center gap-1">
              <Value size="normal">
                <NumericValue value={incentivesRewards?.toFixed(6) || "0.00"} />
              </Value>
            </div>
          </div> */}

          <CustomTabs value={tab}>
            <ScrollArea className="h-full w-full" scrollHideDelay={200}>
              <div className="flex justify-between items-center">
                <CustomTabsList className="flex p-0 justify-start space-x-0 w-full h-8">
                  {msSort === MSSortValues.MS2 ? (
                    <>
                      <CustomTabsTrigger
                        onClick={() => setTab("ms2-total-rewards")}
                        key={`ms2-total-rewards-tab`}
                        value={"ms2-total-rewards"}
                        className="capitalize w-full rounded-none"
                      >
                        Total rewards
                      </CustomTabsTrigger>
                      {configuration?.epochEntries
                        ?.toReversed()
                        .filter(
                          (entry) =>
                            entry.startTimestamp !== 0 &&
                            entry.startTimestamp <
                              Math.floor(Date.now() / 1000),
                        )
                        ?.map((entry) => (
                          <CustomTabsTrigger
                            onClick={() => setTab(entry.epochId.toString())}
                            key={`${entry.epochId}-tab`}
                            value={entry.epochId.toString()}
                            id={`${entry.epochId}-tab`}
                            disabled={entry.startTimestamp > Date.now() / 1000}
                            className="capitalize w-full rounded-none"
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
                    >
                      Leaderboard
                    </CustomTabsTrigger>
                  )}
                </CustomTabsList>
              </div>
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
      </div>

      <style jsx global>{`
        table tbody * {
          @apply font-ubuntu !text-lg font-normal text-white;
        }
        table tbody tr:first-child td:first-child > div > div {
          max-width: 24px;
        }

        /* Falling animation for Mangrove logos */
        .falling-container {
          perspective: 1000px;
        }

        .falling-logo {
          will-change: transform;
          transform-style: preserve-3d;
        }

        .falling-logo-1 {
          animation: fall1 4.2s cubic-bezier(0.47, 0, 0.745, 0.715) infinite;
          animation-delay: 0.2s;
          left: 20%;
          top: -48px;
        }

        .falling-logo-2 {
          animation: fall2 3.8s cubic-bezier(0.47, 0, 0.745, 0.715) infinite;
          animation-delay: 1.1s;
          left: 35%;
          top: -48px;
        }

        .falling-logo-3 {
          animation: fall3 4.5s cubic-bezier(0.47, 0, 0.745, 0.715) infinite;
          animation-delay: 0.7s;
          left: 50%;
          top: -48px;
        }

        .falling-logo-4 {
          animation: fall4 3.6s cubic-bezier(0.47, 0, 0.745, 0.715) infinite;
          animation-delay: 1.5s;
          left: 65%;
          top: -48px;
        }

        .falling-logo-5 {
          animation: fall5 4.7s cubic-bezier(0.47, 0, 0.745, 0.715) infinite;
          animation-delay: 0.3s;
          left: 80%;
          top: -48px;
        }

        .falling-logo-6 {
          animation: fall6 4s cubic-bezier(0.47, 0, 0.745, 0.715) infinite;
          animation-delay: 2.1s;
          left: 10%;
          top: -48px;
        }

        @keyframes fall1 {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg) scale(0.8);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          100% {
            transform: translateY(300px) translateX(20px) rotate(360deg)
              scale(0.8);
            opacity: 0;
          }
        }

        @keyframes fall2 {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg) scale(0.6);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          100% {
            transform: translateY(300px) translateX(-30px) rotate(-270deg)
              scale(0.6);
            opacity: 0;
          }
        }

        @keyframes fall3 {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg) scale(1);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          100% {
            transform: translateY(300px) translateX(15px) rotate(180deg)
              scale(1);
            opacity: 0;
          }
        }

        @keyframes fall4 {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg) scale(0.7);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          100% {
            transform: translateY(300px) translateX(-25px) rotate(-360deg)
              scale(0.7);
            opacity: 0;
          }
        }

        @keyframes fall5 {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg) scale(0.9);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          100% {
            transform: translateY(300px) translateX(10px) rotate(420deg)
              scale(0.9);
            opacity: 0;
          }
        }

        @keyframes fall6 {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg) scale(0.75);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          100% {
            transform: translateY(300px) translateX(-15px) rotate(-420deg)
              scale(0.75);
            opacity: 0;
          }
        }

        .drop-shadow-glow {
          filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.4));
        }
      `}</style>
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
