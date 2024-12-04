"use client"

import Link from "next/link"
import { formatUnits } from "viem"

import NeonContainer from "@/components/neon-container"
import { NumericValue } from "@/components/numeric-value"
import { Caption } from "@/components/typography/caption"
import { Title } from "@/components/typography/title"
import { Button } from "@/components/ui/button"
import { ToucanIllustration } from "@/svgs"
import { cn } from "@/utils"
import { Tables } from "./_components/tables/tables"
import Timer from "./_components/timer"
import { useRewards } from "./hooks/use-rewards"
import { useConfiguration } from "./hooks/use-rewards-config"

export default function Page() {
  const { data: configuration } = useConfiguration()
  const { data: rewards } = useRewards({
    epochId: configuration?.epochId || "1",
  })

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
                    {configuration?.nextEpoch
                      ? (() => {
                          const nextEpochTime = new Date(
                            configuration.nextEpoch ?? 0,
                          ).getTime()
                          const timeLeft = nextEpochTime - Date.now()

                          const days = Math.floor(
                            timeLeft / (1000 * 60 * 60 * 24),
                          )
                          const hours = Math.floor(
                            (timeLeft % (1000 * 60 * 60 * 24)) /
                              (1000 * 60 * 60),
                          )
                          const minutes = Math.floor(
                            (timeLeft % (1000 * 60 * 60)) / (1000 * 60),
                          )

                          return `${days} d: ${hours} h: ${minutes} m`
                        })()
                      : "..."}
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
                <Label>Kandel Rewards</Label>
                <Value size="small">
                  <NumericValue
                    value={formatUnits(BigInt(rewards?.kandelRewards ?? 0n), 8)}
                  />
                </Value>
              </div>
            </div>
          </div>

          <Title variant={"title1"} className="pl-5 mt-8 mb-4">
            Season 1 Points program
          </Title>
          <Tables />
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
