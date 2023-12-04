import {
  CustomTabs,
  CustomTabsList,
  CustomTabsTrigger,
} from "@/components/stateless/custom-tabs"
import { OrderTypes } from "../types"

type Props = {
  orderType: string
  setOrderType: (type: string) => void
}

const orderTypesArray = Object.values(OrderTypes)

export default function Menu({ orderType, setOrderType }: Props) {
  return (
    <div className="inline-block align-middle">
      <CustomTabs
        defaultValue={orderType}
        onValueChange={(e) => setOrderType(e)}
      >
        <CustomTabsList className="w-full py-0">
          {orderTypesArray.map((name) => (
            <CustomTabsTrigger key={`${name}-tab`} value={name}>
              {name}
            </CustomTabsTrigger>
          ))}
        </CustomTabsList>
      </CustomTabs>
    </div>
  )
}
