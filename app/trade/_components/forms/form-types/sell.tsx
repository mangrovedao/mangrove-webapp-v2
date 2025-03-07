import {
  CustomRadioGroup,
  CustomRadioGroupItem,
} from "@/components/custom-radio-group-new"
import useLocalStorage from "@/hooks/use-local-storage"
import { Limit } from "../limit/limit"
import { Market } from "../market/market"

enum FormType {
  LIMIT = "Limit",
  MARKET = "Market",
}

export function Sell() {
  const [formType, setFormType] = useLocalStorage<FormType | null>(
    "formType",
    null,
  )

  // If formType is null, use the default value
  const currentFormType = formType ?? FormType.LIMIT

  return (
    <>
      <CustomRadioGroup
        name={"formType"}
        value={currentFormType}
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
      {currentFormType === FormType.LIMIT && <Limit />}
      {currentFormType === FormType.MARKET && <Market />}
    </>
  )
}
