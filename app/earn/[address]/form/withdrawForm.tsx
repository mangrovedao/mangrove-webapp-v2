"use client"

import { TokenIcon } from "@/components/token-icon-new"
import { Caption } from "@/components/typography/caption"
import { Title } from "@/components/typography/title"
import { Button } from "@/components/ui/button"
import { cn } from "@/utils"
import React, { ReactNode } from "react"
import { erc20Abi, type Address } from "viem"
import { useAccount, useReadContract } from "wagmi"
import { vault } from "../page"
import useForm from "./use-form"

const sliderValues = [25, 50, 75]

export function WithdrawForm({ className }: { className?: string }) {
  const [sliderValue, setSliderValue] = React.useState<number | undefined>(0)
  const [removeDialog, setRemoveDialog] = React.useState(false)

  const { baseToken, quoteToken } = useForm()

  const { address } = useAccount()

  const { data: balance, isLoading } = useReadContract({
    address: vault?.address as Address,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address as Address],
    query: {
      enabled: !!address || !!vault,
    },
  })

  const amount = balance ? (balance * BigInt(sliderValue || 0)) / 100n : 0n

  // if (!baseToken || !quoteToken || !vault || !address)
  //   return (
  //     <div className={"p-0.5"}>
  //       <Skeleton className="w-full h-40" />
  //     </div>
  //   )

  return (
    <form
      className={cn("space-y-4", className)}
      onSubmit={(e) => {
        e.preventDefault()
      }}
    >
      <div>
        <div className="grid bg-bg-primary rounded-lg p-2 gap-1 ">
          <Title className="mb-1">
            50
            <span className="text-text-tertiary text-xs"> %</span>
          </Title>
          <div className="grid gap-2">
            <Line
              icon={vault?.market.base.symbol!}
              title={vault?.market.base.symbol!}
              value={0.266}
            />
            <Line
              title={vault?.market.quote.symbol!}
              value={0.266}
              icon={vault?.market.quote.symbol!}
            />
          </div>
          {/* Buttons loop */}
          <div className="flex justify-center space-x-2 mt-2">
            {sliderValues.map((value) => (
              <Button
                key={`percentage-button-${value}`}
                variant={"secondary"}
                size={"xs"}
                className={cn(
                  "!h-6 text-xs w-full !rounded-md flex items-center justify-center border-none ",
                )}
                onClick={(e) => {
                  e.preventDefault()
                  console.log(e)
                }}
                // disabled={!currentMarket}
              >
                {value}%
              </Button>
            ))}

            <Button
              key={`percentage-button-max`}
              variant={"secondary"}
              size={"xs"}
              className={cn(
                "!h-6 text-xs w-full !rounded-md flex items-center justify-center border-none",
              )}
              onClick={(e) => {
                e.preventDefault()
                console.log(e)
              }}
              // disabled={!currentMarket}
            >
              Max
            </Button>
          </div>
        </div>
      </div>

      <Button
        className="w-full"
        onClick={() => setRemoveDialog(!removeDialog)}
        disabled={amount === 0n || isLoading}
      >
        Withdraw
      </Button>
      {/* <RemoveFromVaultDialog
        vault={vault!}
        amount={amount}
        onClose={() => setRemoveDialog(false)}
        isOpen={removeDialog}
      /> */}
    </form>
  )
}

const Line = ({
  title,
  value,
  icon,
}: {
  icon: string
  title: ReactNode
  value: ReactNode
}) => {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <TokenIcon symbol={icon} className="w-5 h-5" />
        <Caption className="text-gray text-xs"> {title}</Caption>
      </div>
      <Caption className="text-text-primary text-xs">{value} </Caption>
    </div>
  )
}
