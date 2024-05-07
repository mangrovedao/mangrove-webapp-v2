import React from "react"

import {
  CustomRadioGroup,
  CustomRadioGroupItem,
} from "@/components/custom-radio-group"
import { CustomTabs } from "@/components/custom-tabs"
import { Passive } from "./passive"
import { Pro } from "./pro"
import { Strategies } from "./strategies/strategies"

enum StrategiesTables {
  ALL_VAULTS = "All Vault",
  BOOSTED = "Boosted",
  MY_VAULTS = "My vaults",
}

enum SortValues {
  MARKET = "Market",
  LIQUIDITY_SOURCE = "Liquidity source",
  Return = "Return",
}

enum StrategyType {
  PASSIVE = "Passive",
  PRO = "Pro",
}

const TABS_CONTENT = {
  [StrategiesTables.ALL_VAULTS]: (
    <div>
      TODO <Strategies type="user" />
    </div>
  ),
  [StrategiesTables.BOOSTED]: (
    <div>
      TODO <Strategies type="user" />
    </div>
  ),
  [StrategiesTables.MY_VAULTS]: <Strategies type="user" />,
}

export function Tables({
  className,
  ...props
}: React.ComponentProps<typeof CustomTabs>) {
  const [strategiesType, setStrategiesType] = React.useState(StrategyType.PRO)

  return (
    <div className="pt-4 space-y-4">
      <CustomRadioGroup
        name={"strategy-type"}
        value={strategiesType}
        onValueChange={(e: StrategyType) => {
          console.log(e)
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
      {strategiesType === StrategyType.PASSIVE ? <Passive /> : <Pro />}
    </div>
  )
}
