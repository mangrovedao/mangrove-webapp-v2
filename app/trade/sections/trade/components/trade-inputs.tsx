import { CustomNumericInput } from "@components/stateless/custom-numeric-input"
import { Label } from "@components/ui/label"
import SelectMarket from "./select-market"

export default function TradeInputs() {
  return (
    <div className="space-y-2">
      <div>
        <Label> Token pair</Label>
        <SelectMarket />
      </div>
      <div>
        <Label> Send amount</Label>
        <CustomNumericInput icon="BASE" />
      </div>
      <div>
        <Label> Receive amount</Label>
        <CustomNumericInput icon="QUOTE" />
      </div>
      <div>
        <Label> Limit avg. price</Label>
        <CustomNumericInput icon="QUOTE" />
      </div>
    </div>
  )
}
