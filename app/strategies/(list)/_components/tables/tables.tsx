import React from "react"

import {
  CustomRadioGroup,
  CustomRadioGroupItem,
} from "@/components/custom-radio-group"
import { CustomTabs } from "@/components/custom-tabs"
import { useAccount } from "wagmi"
import { Strategies } from "./strategies/strategies"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

enum StrategyType {
  PASSIVE = "Passive",
  PRO = "Pro",
}

export function Tables({
  className,
  hideCreateStrat,
  ...props
}: React.ComponentProps<typeof CustomTabs> & {
  hideCreateStrat: (bool: boolean) => void
}) {
  const [strategiesType, setStrategiesType] = React.useState(StrategyType.PRO)
  const { chain } = useAccount()
  React.useEffect(() => {
    if (strategiesType === "Passive") {
      hideCreateStrat(true)
    } else {
      hideCreateStrat(false)
    }
  }, [strategiesType])

  return (
    <div className="pt-4 space-y-4">
      <CustomRadioGroup
        name={"strategy-type"}
        value={strategiesType}
        onValueChange={(e: StrategyType) => {
          setStrategiesType(e)
        }}
        className="max-w-96"
      >
        {Object.values(StrategyType).map((action) => (
          <CustomRadioGroupItem
            key={action}
            value={action}
            id={action}
            className="capitalize"
            disabled={
              action === StrategyType.PASSIVE && chain?.name === "Arbitrum One"
            }
          >
            <TooltipProvider>
              <Tooltip delayDuration={200}>
                <TooltipTrigger className="hover:opacity-80 transition-opacity">
                  {action}
                </TooltipTrigger>
                <TooltipContent
                  hidden={
                    action === StrategyType.PRO ||
                    chain?.name !== "Arbitrum One"
                  }
                >
                  Please switch to a supported network
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CustomRadioGroupItem>
        ))}
      </CustomRadioGroup>
      <Strategies type="user" />
    </div>
  )
}
