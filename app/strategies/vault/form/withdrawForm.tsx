"use client"

import { Button } from "@/components/ui/button-old"
import { Skeleton } from "@/components/ui/skeleton"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/utils"
import React from "react"
import { erc20Abi, type Address } from "viem"
import { useAccount, useReadContract } from "wagmi"
import RemoveFromVaultDialog from "./dialogs/withdraw-dialog"
import useForm from "./use-form"

const sliderValues = [25, 50, 75, 100]

export function RemoveForm({ className }: { className?: string }) {
  const [sliderValue, setSliderValue] = React.useState<number | undefined>(0)
  const [removeDialog, setRemoveDialog] = React.useState(false)

  const { vault, baseToken, quoteToken } = useForm()

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

  if (!baseToken || !quoteToken || !vault || !address)
    return (
      <div className={"p-0.5"}>
        <Skeleton className="w-full h-screen" />
      </div>
    )

  return (
    <form
      className={cn("space-y-6", className)}
      onSubmit={(e) => {
        e.preventDefault()
      }}
    >
      <div className="space-y-5 pt-2 px-3">
        <Slider
          name={"sliderPercentage"}
          defaultValue={[0]}
          value={[Number(sliderValue)]}
          step={5}
          min={0}
          max={100}
          onValueChange={([value]) => {
            setSliderValue(value)
          }}
          // disabled={!(currentMarket && form.state.isFormValid)}
        />
        <div className="flex justify-center space-x-3">
          {sliderValues.map((value) => (
            <Button
              key={`percentage-button-${value}`}
              variant={"secondary"}
              size={"sm"}
              className={cn("text-xs w-full", {
                "opacity-10": Number(sliderValue) !== value,
              })}
              onClick={(e) => {
                e.preventDefault()
                setSliderValue(Number(value))
              }}
            >
              {value}%
            </Button>
          ))}
        </div>
      </div>

      <Button
        rightIcon
        className="w-full"
        onClick={() => setRemoveDialog(!removeDialog)}
        disabled={amount === 0n || isLoading}
      >
        Remove
      </Button>
      <RemoveFromVaultDialog
        vault={vault}
        amount={amount}
        onClose={() => setRemoveDialog(false)}
        isOpen={removeDialog}
      />
    </form>
  )
}
