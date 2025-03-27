"use client"

import { TokenIcon } from "@/components/token-icon-new"
import { Caption } from "@/components/typography/caption"
import { Title } from "@/components/typography/title"
import { Button } from "@/components/ui/button"
import { cn } from "@/utils"
import React, { ReactNode } from "react"
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi"

import { Skeleton } from "@/components/ui/skeleton"
import { useDisclaimerDialog } from "@/stores/disclaimer-dialog.store"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { formatUnits, parseAbi, parseUnits } from "viem"
import useForm from "./use-form"

const sliderValues = [25, 50, 75]

const burnABI = parseAbi([
  "function burn(uint256 shares, uint256 minAmountBaseOut, uint256 minAmountQuoteOut) external returns (uint256 amountBaseOut, uint256 amountQuoteOut)",
])

export function WithdrawForm({ className }: { className?: string }) {
  const [sliderValue, setSliderValue] = React.useState(0)
  const [baseWithdraw, setBaseWithdraw] = React.useState("0")
  const [quoteWithdraw, setQuoteWithdraw] = React.useState("0")
  const [withdrawAmount, setWithdrawAmount] = React.useState("0")
  const { data: hash, isPending, writeContract } = useWriteContract()
  const queryClient = useQueryClient()
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    })

  React.useEffect(() => {
    if (isConfirmed) {
      toast.success(`Assets successfully withdrawn`)
      queryClient.refetchQueries({
        queryKey: ["vault"],
      })
    }
  }, [isConfirmed, queryClient])

  const [removeDialog, setRemoveDialog] = React.useState(false)

  const {
    baseToken,
    quoteToken,
    vault,
    quoteDeposited,
    baseDeposited,
    isLoading,
  } = useForm()

  const { address } = useAccount()
  const { checkAndShowDisclaimer } = useDisclaimerDialog()

  const handleSliderChange = (value: number) => {
    if (!quoteDeposited || !baseDeposited) return
    const baseAmount =
      (BigInt(value * 100) * (vault?.userBaseBalance || 0n)) / 10_000n
    const quoteAmount =
      (BigInt(value * 100) * (vault?.userQuoteBalance || 0n)) / 10_000n
    const mintedAmunt =
      (BigInt(value * 100) * (vault?.mintedAmount || 0n)) / 10_000n

    setSliderValue(value)
    setBaseWithdraw(formatUnits(baseAmount, baseToken?.decimals ?? 18))
    setQuoteWithdraw(formatUnits(quoteAmount, quoteToken?.decimals ?? 18))
    setWithdrawAmount(formatUnits(mintedAmunt, vault?.decimals ?? 18))
  }

  React.useEffect(() => {
    handleSliderChange(25)
  }, [quoteDeposited, baseDeposited])

  if (!baseToken || !quoteToken || !vault)
    return (
      <div className={"p-0.5"}>
        <Skeleton className="w-full h-40" />
      </div>
    )

  return (
    <form
      className={cn("flex flex-col h-full", className)}
      onSubmit={(e) => {
        e.preventDefault()
      }}
    >
      <div>
        <div className="grid rounded-lg p-4 gap-1 flex-1 h-full bg-bg-primary min-h-[200px]">
          <Title className="mb-1" variant={"header1"}>
            {sliderValue}
            <span className="text-text-tertiary text-sm"> %</span>
          </Title>
          <div className="grid gap-2">
            <Line
              icon={vault?.market.base.symbol}
              title={vault?.market.base.symbol}
              value={Number(baseWithdraw).toFixed(
                baseToken?.displayDecimals ?? 4,
              )}
            />
            <Line
              title={vault?.market.quote.symbol}
              icon={vault?.market.quote.symbol}
              value={Number(quoteWithdraw).toFixed(
                quoteToken?.displayDecimals ?? 4,
              )}
            />
            <span className="text-text-tertiary text-xs">Burn:</span>
            <Line
              title={vault?.symbol}
              icon={vault?.symbol}
              value={Number(withdrawAmount).toFixed(4)}
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
                  {
                    "bg-bg-tertiary": sliderValue === value,
                  },
                )}
                onClick={(e) => {
                  e.preventDefault()
                  handleSliderChange(value)
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
                handleSliderChange(100)
              }}
              // disabled={!currentMarket}
            >
              Max
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-4">
        <Button
          loading={isPending}
          className="w-full hover:bg-bg-tertiary bg-bg-primary"
          onClick={() => {
            if (checkAndShowDisclaimer(address)) return

            writeContract({
              address: vault.address,
              abi: burnABI,
              functionName: "burn",
              args: [parseUnits(withdrawAmount, vault.decimals), 0n, 0n],
            })
          }}
          disabled={Number(withdrawAmount) === 0 || isPending}
        >
          Withdraw
        </Button>
      </div>
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
        <TokenIcon symbol={icon} className="w-5 h-5" imgClasses="w-5 h-5" />
        <Caption className="text-xs text-text-secondary"> {title}</Caption>
      </div>
      <Caption className="text-text-primary text-xs">{value} </Caption>
    </div>
  )
}
