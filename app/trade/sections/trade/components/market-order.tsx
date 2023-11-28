import React from "react"

import { ChevronDown, ChevronUp, Percent } from "lucide-react"

import { NumericInput } from "@/components/stateless/numeric-input"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Label } from "@components/ui/label"

export default function MarketOrder() {
  const slippageOptions = ["0.1", "0.5", "1.0"]
  const [slippage, setSlippage] = React.useState<string>("0.5")
  const [customSlippage, setCustomSlippage] = React.useState<boolean>(false)
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <div className="space-y-5 pt-5">
      <Separator />
      <div className="flex justify-between items-baseline">
        <Label className="text-secondary">Average market price</Label>
        <span>$0.00</span>
      </div>

      <Separator />

      <div className="flex justify-between">
        <Label>Slippage Tolerence</Label>
        <span>{slippage} %</span>
      </div>

      <RadioGroup
        defaultValue={slippage}
        onValueChange={(e) => {
          if (e === "custom") {
            setCustomSlippage(!customSlippage)
          } else {
            setSlippage(e)
            setCustomSlippage(false)
          }
        }}
      >
        {slippageOptions.map((item, i) => (
          <RadioGroupItem
            key={i}
            value={item}
            id={item}
            className="flex items-center space-x-2"
          >
            <Label
              htmlFor={item}
              // TODO: move cursor pointer inside radio UI component
              className="cursor-pointer"
            >{`${item}%`}</Label>
          </RadioGroupItem>
        ))}
        <RadioGroupItem
          key={"custom-slippage"}
          value={"custom"}
          id={"custom"}
          className="flex items-center space-x-2"
        >
          <Label htmlFor={"custom-slippage"} className="cursor-pointer">
            Custom
          </Label>
        </RadioGroupItem>
      </RadioGroup>
      {customSlippage ? (
        <>
          <NumericInput
            className="w-full  text-primary "
            // onUserInput={(e) => {
            //   if (!e) setSlippage("0")
            //   else setSlippage(e)
            // }}
            value={slippage}
            placeholder="Custom"
            symbol={<Percent size="15" />}
          />
        </>
      ) : null}
      <Separator />

      <div className="py-5">
        <Collapsible
          open={isOpen}
          onOpenChange={setIsOpen}
          className="w-full space-y-2"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">Details</h4>
            <CollapsibleTrigger asChild>
              <Button variant="invisible" size="sm">
                {!isOpen && <ChevronDown className="h-6 w-6" />}
                {isOpen && <ChevronUp className="h-6 w-6" />}

                <span className="sr-only">Toggle</span>
              </Button>
            </CollapsibleTrigger>
          </div>
          <div className="flex justify-between text-md">
            <Label className="text-secondary">Taker fee</Label>
            <span>$ 0.00</span>
          </div>
          <CollapsibleContent className="space-y-2">
            <div className="flex justify-between text-xs">
              <Label className="text-secondary">Tick size</Label>
              <span>$ 0.00</span>
            </div>
            <div className="flex justify-between text-xs">
              <Label className="text-secondary">Current spot price</Label>
              <span>$ 0.00</span>
            </div>
            <div className="flex justify-between text-xs">
              <Label className="text-secondary">Current spot price</Label>
              <span>$ 0.00</span>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  )
}
