import { cn } from "@/utils"

type StepsProps = {
  currentStep: number
  steps?: string[]
}

export function Steps({ currentStep = 1, steps }: StepsProps) {
  return (
    <div className="flex w-full gap-2 !my-8">
      {steps?.map((value, i) => (
        <Step key={value} number={i + 1} active={currentStep >= i + 1}>
          {value}
        </Step>
      ))}
    </div>
  )
}

type StepProps = {
  children: React.ReactNode
  number: number
  active?: boolean
}

function Step({ children, number, active = false }: StepProps) {
  if (!children) return
  return (
    <div className="flex-1 space-y-4">
      <div
        className={cn("w-full h-[2px] rounded-full transition-colors", {
          "bg-green-caribbean": active,
          "bg-gray-scale-600": !active,
        })}
      ></div>
      <div className="space-y-1">
        <div className="text-[10px] text-gray-scale-300">Step {number}</div>
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
