import { BS } from "@mangrovedao/mgv/lib"
import React from "react"

import {
  CustomRadioGroup,
  CustomRadioGroupItem,
} from "@/components/custom-radio-group-new"
import { Limit } from "../limit/limit"
import { Market } from "../market/market"

enum FormType {
  LIMIT = "Limit",
  MARKET = "Market",
}

export function Sell() {
  const [formType, setFormType] = React.useState(FormType.LIMIT)

  return (
    <>
      <CustomRadioGroup
        name={"formType"}
        value={formType}
        defaultValue={Object.values(formType)[0]}
        onValueChange={(e: FormType) => {
          setFormType(e)
        }}
      >
        {Object.values(FormType).map((action) => (
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
      {/* Note: selling forms */}
      {formType === FormType.LIMIT && <Limit bs={BS.sell} />}
      {formType === FormType.MARKET && <Market bs={BS.sell} />}
    </>
  )
}
