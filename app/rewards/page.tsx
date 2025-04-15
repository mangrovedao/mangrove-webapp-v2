"use client"

import Link from "next/link"
import React from "react"

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

import { useDefaultChain } from "@/hooks/use-default-chain"
import { getExactWeiAmount } from "@/utils/regexp"
import { arbitrum } from "viem/chains"
import { useAccount } from "wagmi"
import { useLeaderboard } from "./_components/tables/leaderboard/hooks/use-leaderboard"
import { LeaderboardTable } from "./_components/tables/leaderboard/leaderboard-table"
import { Ms2Table } from "./_components/tables/ms2/ms2-table"
export default function Page() {
  const [tab, setTab] = React.useState("leaderboard")
  const { address: user } = useAccount()
  const { data: leaderboard } = useLeaderboard()
  const { defaultChain } = useDefaultChain()

  // Calculate total rewards across all users
  const totalStats = leaderboard?.reduce(
    (acc, entry) => {
      return {
        totalVolumeRewards: acc.totalVolumeRewards + entry.volumeRewards,
        totalVaultRewards: acc.totalVaultRewards + entry.vaultRewards,
        totalRewards: acc.totalRewards + entry.totalRewards,
      }
    },
    { totalVolumeRewards: 0, totalVaultRewards: 0, totalRewards: 0 },
  )

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
          <div
            className="w-full rounded-sm border border-solid p-3 relative "
            style={{
              boxShadow: "0px 0px 24px rgba(0, 203, 111, 0.4)",
            }}
          >
            <div
              className="absolute inset-[1px] rounded-sm -z-20"
              style={{
                background: "linear-gradient(30deg, #7BAFB9 0%, #00CB6F 100%)",
              }}
            ></div>
            <div className="absolute inset-[3px] bg-[#0B1819] rounded-sm -z-10"></div>
            <div className="absolute top-0 right-0 hidden sm:block md:-translate-x-1/2 -translate-y-2/3">
              <ToucanIllustration />
            </div>
            <div className="flex justify-center">
              <div className="flex flex-col">
                <Title
                  variant={"title1"}
                  className="text-center text-text-secondary"
                >
                  Mangrove Rewards Leaderboard
                </Title>
                <Caption className="text-center mt-2" variant={"caption1"}>
                  Track your position in real-time! Vault rewards update
                  continuously based on your deposits, while trading volume
                  rewards are calculated instantly with each transaction you
                  make.
                </Caption>
                <Caption className="text-center mt-1">
                  Compete with other users to earn more MGV tokens.
                </Caption>
              </div>
            </div>
          </div>
          {/* <div className="px-8">
            <hr className="px-6" />
          </div> */}
          <div className="px-4 py-5 flex gap-4 items-center justify-between relative">
            {/* Left side */}

            <div className="flex items-center gap-4 w-full justify-evenly">
              <div className="flex flex-col">
                <Label>Total Reward</Label>
                <Value className="flex-wrap text-wrap">
                  <NumericValue
                    value={getExactWeiAmount(
                      totalStats?.totalRewards.toString() ?? "0",
                      8,
                    )}
                  />
                </Value>
              </div>
              <div className="flex flex-col">
                <Label>Volume Rewards</Label>
                <Value size="normal">
                  <NumericValue
                    value={getExactWeiAmount(
                      totalStats?.totalVolumeRewards.toString() ?? "0",
                      8,
                    )}
                  />
                </Value>
              </div>
              <div className="flex flex-col">
                <Label>Vault Rewards</Label>
                <Value size="normal">
                  <NumericValue
                    value={getExactWeiAmount(
                      totalStats?.totalVaultRewards.toString() ?? "0",
                      8,
                    )}
                  />
                </Value>
              </div>
            </div>

            {/* Middle side: Falling Mangrove Logos */}
            <div className="absolute inset-0 w-full overflow-hidden opacity-80 flex items-center justify-center">
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
          </div>

          <CustomTabs value={tab}>
            <ScrollArea className="h-full w-full" scrollHideDelay={200}>
              <div className="flex justify-between items-center">
                <CustomTabsList className="flex p-0 justify-start space-x-0 w-full h-8">
                  <CustomTabsTrigger
                    onClick={() => setTab("leaderboard")}
                    key={`leaderboard`}
                    value={"leaderboard"}
                    className="capitalize w-full rounded-none"
                  >
                    Leaderboard
                  </CustomTabsTrigger>
                  {arbitrum.id === defaultChain.id && (
                    <>
                      <CustomTabsTrigger
                        onClick={() => setTab("ms2")}
                        key={`ms2`}
                        value={"ms2"}
                        className="capitalize w-5/12 rounded-none"
                      >
                        MS2 Total rewards
                      </CustomTabsTrigger>
                    </>
                  )}
                </CustomTabsList>
              </div>
              <ScrollBar orientation="horizontal" className="z-50" />
            </ScrollArea>

            <div className="w-full pb-4 px-1">
              {/* leaderboard */}
              <CustomTabsContent value={"leaderboard"}>
                <ScrollArea className="h-full" scrollHideDelay={200}>
                  <div className="px-2 h-full">
                    <LeaderboardTable />
                  </div>
                  <ScrollBar orientation="vertical" className="z-50" />
                  <ScrollBar orientation="horizontal" className="z-50" />
                </ScrollArea>
              </CustomTabsContent>

              {/* ms2 leaderboards */}
              <CustomTabsContent value={"ms2"}>
                <ScrollArea className="h-full" scrollHideDelay={200}>
                  <div className="px-2 h-full">
                    <Ms2Table />
                  </div>
                  <ScrollBar orientation="vertical" className="z-50" />
                  <ScrollBar orientation="horizontal" className="z-50" />
                </ScrollArea>
              </CustomTabsContent>
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
