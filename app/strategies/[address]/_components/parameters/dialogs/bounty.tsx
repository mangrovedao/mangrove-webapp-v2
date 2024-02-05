"use client"

import useStrategyStatus from "@/app/strategies/(shared)/_hooks/use-strategy-status"
import { Steps } from "@/app/strategies/new/_components/form/components/steps"
import Dialog from "@/components/dialogs/dialog"
import { EnhancedNumericInput } from "@/components/token-input"
import { Text } from "@/components/typography/text"
import { Title } from "@/components/typography/title"
import { Button } from "@/components/ui/button"
import { useStep } from "@/hooks/use-step"
import { cn } from "@/utils"
import { LucideChevronRight } from "lucide-react"
import React from "react"
import { useAccount, useBalance } from "wagmi"
import useKandel from "../../../_providers/kandel-strategy"
import { useBounty } from "../mutations/use-bounty"
import { DialogCompleted } from "./dialog-completed"

type Props = {
  open: boolean
  onClose: () => void
}

export function Bounty({ open, onClose }: Props) {
  const [bountyCompleted, toggleBountyCompleted] = React.useState(false)

  const { strategyQuery, strategyStatusQuery, strategyAddress } = useKandel()
  const { market } = strategyStatusQuery.data ?? {}
  const { data: strategy } = useStrategyStatus({
    address: strategyAddress,
    base: market?.base.symbol,
    quote: market?.quote.symbol,
    offers: strategyQuery.data?.offers,
  })

  let steps = ["Set", "Add Bounty"]
  const [currentStep, helpers] = useStep(steps.length)
  const { goToNextStep, reset } = helpers

  const [bounty, setBounty] = React.useState("")

  const addBounty = useBounty({
    stratInstance: strategy?.stratInstance,
    bounty,
  })

  const { address } = useAccount()
  const { data: nativeBalance } = useBalance({
    address,
  })

  const stepInfos = [
    {
      body: (
        <div className="grid gap-4">
          <EnhancedNumericInput
            balanceAction={{
              onClick: () => setBounty(nativeBalance?.value.toString() || ""),
              text: "MAX",
            }}
            label={`${nativeBalance?.symbol} amount`}
            showBalance
            token={nativeBalance?.symbol}
            onChange={(e) => setBounty(e.target.value)}
            error={
              Number(bounty) > Number(nativeBalance?.value)
                ? "Invalid amount"
                : ""
            }
          />
        </div>
      ),
      button: (
        <Button
          disabled={!bounty}
          onClick={goToNextStep}
          className="w-full flex items-center justify-center !mt-6"
        >
          Proceed{" "}
          <div
            className={cn(
              "ml-2 bg-white h-6 w-6 rounded-full text-secondary flex items-center justify-center transition-opacity",
              {
                "opacity-10": !bounty,
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
            <Text>{nativeBalance?.symbol} bounty</Text>
            <Text className="text-primary">
              {bounty} {nativeBalance?.symbol}
            </Text>
          </div>
        </div>
      ),
      button: (
        <Button
          disabled={addBounty.isPending}
          loading={addBounty.isPending}
          onClick={() =>
            addBounty.mutate(undefined, {
              onSuccess() {
                toggleBountyCompleted(!bountyCompleted)
                onClose()
                reset()
              },
            })
          }
          className="w-full flex items-center justify-center !mt-6"
        >
          Add Bounty
          <div
            className={cn(
              "ml-2 bg-white h-6 w-6 rounded-full text-secondary flex items-center justify-center transition-opacity",
              {
                "opacity-10": addBounty.isPending,
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
      <DialogCompleted
        title="Bounty Added"
        open={bountyCompleted}
        onClose={() => toggleBountyCompleted(false)}
      />

      <Dialog open={!!open} onClose={onClose} showCloseButton={false}>
        <Dialog.Title className="text-xl text-left" close>
          <Title
            as={"div"}
            variant={"header1"}
            className="space-x-3 flex items-center"
          >
            Deposit
          </Title>
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
