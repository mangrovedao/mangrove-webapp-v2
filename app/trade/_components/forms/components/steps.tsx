import InfoTooltip from "@/components/info-tooltip"
import { Caption } from "@/components/typography/caption"
import { cn } from "@/utils"

type StepsProps = {
  currentStep: number
  steps: string[]
}

export function Steps({ currentStep = 1, steps }: StepsProps) {
  return (
    <div className="flex w-full gap-2 !my-8">
      {steps.map((value, i) => (
        <Step
          key={value}
          number={i + 1}
          active={currentStep >= i + 1}
          title={steps[i]}
        >
          <div className="flex -space-x-2 items-center">{value}</div>
        </Step>
      ))}
    </div>
  )
}

type StepProps = {
  children: React.ReactNode
  title?: string
  number: number
  active?: boolean
}

function Step({ title, children, number, active = false }: StepProps) {
  return (
    <div className="flex-1 space-y-4">
      <div
        className={cn("w-full h-[2px] rounded-full transition-colors", {
          "bg-green-caribbean": active,
          "bg-gray-scale-600": !active,
        })}
      ></div>
      <div className="space-y-1">
        <div className="text-[10px] text-gray-scale-300 flex items-center">
          Step {number}
          {title?.includes("deployment") ? (
            <InfoTooltip side="right">
              <Caption>Make your approvals safer!</Caption>
              <Caption>If you never used Limit Orders on Mangrove,</Caption>
              <Caption>
                you are required to active your address. Please sign a
                transaction.
              </Caption>
            </InfoTooltip>
          ) : undefined}
          {title?.includes("activation") ? (
            <InfoTooltip>
              <Caption>If you never used Limit Orders on Mangrove,</Caption>
              <Caption>
                you are required to activate this functionality. Please sign a
                transaction.
              </Caption>
            </InfoTooltip>
          ) : undefined}
        </div>
        <div
          className={cn("text-xs transition-colors", {
            "text-white": active,
            "text-gray-scale-400": !active,
          })}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
