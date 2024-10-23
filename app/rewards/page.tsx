"use client"

import { Title } from "@/components/typography/title"
import { Button } from "@/components/ui/button"
import { RaccoonIllustration } from "@/svgs"
import { cn } from "@/utils"
import Timer from "./_components/timer"

export default function Page() {
  return (
    <main className="mt-8 px-4">
      <Title variant={"header1"} className="pl-5">
        Rewards
      </Title>
      <div className="grid grid-cols-6 gap-10 mt-8">
        <div className="lg:col-span-4 col-span-6">
          <div className="rounded-2xl bg-gradient-to-t from-bg-primary to-bg-secondary p-5 flex items-center space-x-2 relative">
            <RaccoonIllustration className="absolute top-0 right-0 hidden sm:block md:-translate-x-1/2 -translate-y-2/3" />
            <Timer />
            <div>
              <h2 className="font-semibold text-2xl">Epoch #5</h2>
              <div className="text-text-secondary text-xs flex space-x-4">
                <span>
                  Ends in <span className="text-white">0d:12h:14m</span>
                </span>
                <div className="w-0.5 h-5 bg-text-secondary"></div>
                <span>
                  Current p: <span className="text-white">200</span>
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
              <Value>3,259</Value>
            </div>
            <div className="flex flex-col flex-1 space-y-2">
              <div className="flex justify-between">
                <Label>Taker Rewards</Label>
                <Value size="small">200</Value>
              </div>
              <div className="flex justify-between">
                <Label>Maker Rewards</Label>
                <Value size="small">0</Value>
              </div>
              <div className="flex justify-between">
                <Label>Kandel Rewards</Label>
                <Value size="small">3,059</Value>
              </div>
            </div>
          </div>

          <Title variant={"title1"} className="pl-5 mt-8 mb-4">
            Season 1 Points program
          </Title>
        </div>
        <div className="lg:col-span-2 col-span-6 h-20">
          <NeonContainer className="space-y-5">
            <div className="flex justify-between">
              <Label>Available rewards</Label>
              <Value>71.675</Value>
            </div>

            <Button variant={"primary"} size={"xl"} className="w-full">
              Claim rewards
            </Button>
          </NeonContainer>
          <div className="flex justify-between my-5">
            <Label>Claimed rewards</Label>
            <Value>11,396</Value>
          </div>
          <div className="flex justify-between mt-5">
            <Label>Total rewards</Label>
            <Value>71.68˝5</Value>
          </div>
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

function NeonContainer({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className="w-full rounded-2xl border border-solid p-5 relative overflow-hidden"
      style={{
        boxShadow: "0px 0px 24px rgba(0, 203, 111, 0.4)",
      }}
    >
      <div
        className="absolute inset-[1px] rounded-2xl -z-20"
        style={{
          background: "linear-gradient(30deg, #7BAFB9 0%, #00CB6F 100%)",
        }}
      ></div>
      <div className="absolute inset-[3px] bg-[#0B1819] rounded-2xl -z-10"></div>

      <div className={className}>{children}</div>
    </div>
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
