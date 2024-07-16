import React from "react"

import {
  CustomRadioGroup,
  CustomRadioGroupItem,
} from "@/components/custom-radio-group"
import { CustomTabs } from "@/components/custom-tabs"
import { Strategies } from "./strategies/strategies"
import { Vaults } from "./vaults/vaults"

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
          >
            {action}
          </CustomRadioGroupItem>
        ))}
      </CustomRadioGroup>
      {strategiesType === StrategyType.PASSIVE ? (
        <Vaults type="all" />
      ) : (
        <Strategies type="user" />
      )}
    </div>
  )
}
