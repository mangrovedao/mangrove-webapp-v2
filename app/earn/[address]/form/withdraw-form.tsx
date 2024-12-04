"use client"

import { TokenIcon } from "@/components/token-icon-new"
import { Caption } from "@/components/typography/caption"
import { Title } from "@/components/typography/title"
import { Button } from "@/components/ui/button"
import { cn } from "@/utils"
import React, { ReactNode } from "react"
import { useAccount } from "wagmi"

import { Skeleton } from "@/components/ui/skeleton"
import { formatUnits } from "viem"
import WithdrawFromVaultDialog from "./dialogs/withdraw-dialog"
import useForm from "./use-form"

const sliderValues = [25, 50, 75]

export function WithdrawForm({ className }: { className?: string }) {
  const [sliderValue, setSliderValue] = React.useState(0)
  const [baseWithdraw, setBaseWithdraw] = React.useState("0")
  const [quoteWithdraw, setQuoteWithdraw] = React.useState("0")
  const [withdrawAmount, setWithdrawAmount] = React.useState("0")

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
      className={cn("space-y-4", className)}
      onSubmit={(e) => {
        e.preventDefault()
      }}
    >
      <div>
        <div className="grid bg-bg-primary rounded-lg p-2 gap-1 ">
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

      <Button
        className="w-full"
        onClick={() => setRemoveDialog(!removeDialog)}
        disabled={Number(withdrawAmount) === 0}
      >
        Withdraw
      </Button>
      {removeDialog ? (
        <WithdrawFromVaultDialog
          infos={{
            baseWithdraw,
            quoteWithdraw,
            withdrawAmount,
          }}
          amount={withdrawAmount}
          vault={vault}
          onClose={() => {
            setRemoveDialog(false)
          }}
          isOpen={removeDialog}
        />
      ) : undefined}
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
        <Caption className="text-gray text-xs text-text-secondary">
          {" "}
          {title}
        </Caption>
      </div>
      <Caption className="text-text-primary text-xs">{value} </Caption>
    </div>
  )
}
