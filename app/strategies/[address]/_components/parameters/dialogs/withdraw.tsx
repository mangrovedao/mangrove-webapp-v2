"use client"

import { LucideChevronRight } from "lucide-react"
import React from "react"
import { useAccount } from "wagmi"

import useStrategyStatus from "@/app/strategies/(shared)/_hooks/use-strategy-status"
import { Steps } from "@/app/strategies/new/_components/form/components/steps"
import Dialog from "@/components/dialogs/dialog"
import InfoTooltip from "@/components/info-tooltip"
import { EnhancedNumericInput } from "@/components/token-input"
import { Caption } from "@/components/typography/caption"
import { Text } from "@/components/typography/text"
import { Title } from "@/components/typography/title"
import { Button } from "@/components/ui/button-old"
import { KANDEL_DOC_URL } from "@/constants/docs"
import { useStep } from "@/hooks/use-step"
import { cn } from "@/utils"
import { shortenAddress } from "@/utils/wallet"
import Link from "next/link"
import useKandel from "../../../_providers/kandel-strategy"
import { useParameters } from "../hook/use-parameters"
import { useWithDraw } from "../mutations/use-withdraw"
import { SuccessDialog } from "./succes-dialog"

type Props = {
  open: boolean
  onClose: () => void
}

export function Withdraw({ open, onClose }: Props) {
  const [withdrawCompleted, toggleWithdrawCompleted] = React.useReducer(
    (isOpen) => !isOpen,
    false,
  )

  const { strategyQuery, strategyAddress, baseToken, quoteToken } = useKandel()
  const { withdrawBase, withdrawQuote } = useParameters()
  const { address } = useAccount()

  const { data: strategy } = useStrategyStatus({
    address: strategyAddress,
    base: baseToken?.symbol,
    quote: quoteToken?.symbol,
    offers: strategyQuery.data?.offers,
  })

  let steps = ["Set", "Withdraw"]

  const [currentStep, helpers] = useStep(steps.length)
  const { goToNextStep, reset } = helpers

  const [baseAmount, setBaseAmount] = React.useState("0")
  const [quoteAmount, setQuoteAmount] = React.useState("0")

  const withdraw = useWithDraw({
    kandelInstance: strategy?.kandelInstance,
    volumes: { baseAmount, quoteAmount },
  })

  const stepInfos = [
    {
      body: (
        <div className="grid gap-4">
          <EnhancedNumericInput
            balanceAction={{
              onClick: () => setBaseAmount(withdrawBase),
            }}
            value={baseAmount}
            label={`${baseToken?.symbol} amount`}
            customBalance={withdrawBase}
            showBalance
            balanceLabel="Withdrawable inventory"
            token={baseToken}
            onChange={(e) => setBaseAmount(e.target.value)}
            error={
              Number(baseAmount) > Number(withdrawBase) ? "Invalid amount" : ""
            }
          />

          <EnhancedNumericInput
            balanceAction={{
              onClick: () => setQuoteAmount(withdrawQuote),
            }}
            value={quoteAmount}
            label={`${quoteToken?.symbol} amount`}
            customBalance={withdrawQuote}
            balanceLabel="Withdrawable inventory"
            onChange={(e) => setQuoteAmount(e.target.value)}
            error={
              Number(quoteAmount) > Number(withdrawQuote)
                ? "Invalid amount"
                : ""
            }
            token={quoteToken}
            showBalance
          />
        </div>
      ),

      button: (
        <Button
          disabled={
            Number(baseAmount) > Number(withdrawBase) ||
            Number(quoteAmount) > Number(withdrawQuote)
          }
          onClick={goToNextStep}
          className="w-full flex items-center justify-center !mt-6"
          size={"lg"}
        >
          Proceed{" "}
          <div
            className={cn(
              "ml-2 bg-white h-6 w-6 rounded-full text-secondary flex items-center justify-center transition-opacity",
              {
                "opacity-10": !baseAmount || !quoteAmount,
              },
            )}
          >
            <LucideChevronRight className="h-4 w-4 text-current" />
          </div>
        </Button>
      ),
    },
    {
      body: (
        <div className="grid gap-2 p-5 bg-primary-dark-green rounded-lg">
          <Title>Review</Title>
          <div className="flex justify-between">
            <Text>{baseToken?.symbol} amount</Text>
            <Text className="text-primary">
              {baseAmount} {baseToken?.symbol}
            </Text>
          </div>
          <div className="flex justify-between">
            <Text>{quoteToken?.symbol} amount</Text>
            <Text className="text-primary">
              {quoteAmount} {quoteToken?.symbol}
            </Text>
          </div>
          <div className="flex justify-between">
            <Text>Send to</Text>
            <Text className="text-primary">
              Wallet {shortenAddress(address ?? "")}
            </Text>
          </div>
        </div>
      ),
      button: (
        <Button
          disabled={withdraw.isPending}
          loading={withdraw.isPending}
          onClick={() =>
            withdraw.mutate(undefined, {
              onSuccess() {
                toggleWithdrawCompleted()
                onClose()
                reset()
              },
            })
          }
          className="w-full flex items-center justify-center !mt-6"
        >
          Withdraw
          <div
            className={cn(
              "ml-2 bg-white h-6 w-6 rounded-full text-secondary flex items-center justify-center transition-opacity",
              {
                "opacity-10": withdraw.isPending,
              },
            )}
          >
            <LucideChevronRight className="h-4 w-4 text-current" />
          </div>
        </Button>
      ),
    },
  ]
    .filter(Boolean)
    .map((stepInfo, i) => {
      return {
        ...stepInfo,
        title: steps[i],
      }
    })

  return (
    <>
      <SuccessDialog
        title={"Withdraw completed"}
        open={withdrawCompleted}
        onClose={toggleWithdrawCompleted}
      />

      <Dialog open={!!open} onClose={onClose} showCloseButton={false}>
        <Dialog.Title className="text-xl text-left" close>
          <div className="flex space-x-2 items-center">
            <Title
              as={"div"}
              variant={"header1"}
              className="space-x-3 flex items-center"
            >
              Withdraw
            </Title>
            <InfoTooltip>
              <Caption>
                Only unpublished funds are available to withdraw.
              </Caption>
              <Link href={KANDEL_DOC_URL} target="_blank">
                <Caption className="text-green-caribbean underline">
                  Learn more
                </Caption>
              </Link>
            </InfoTooltip>
          </div>
        </Dialog.Title>
        <Steps steps={steps} currentStep={currentStep} />
        <Dialog.Description className="text-left !mt-8">
          {stepInfos[currentStep - 1]?.body ?? undefined}
        </Dialog.Description>
        <Dialog.Footer className=" w-full">
          {stepInfos[currentStep - 1]?.button}
        </Dialog.Footer>
      </Dialog>
    </>
  )
}
