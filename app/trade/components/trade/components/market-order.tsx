import React from "react"

import { ChevronDown, Percent } from "lucide-react"

import { NumericInput } from "@/components/stateless/numeric-input"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/utils"
import { Label } from "@components/ui/label"

export default function MarketOrder() {
  const slippageOptions = ["0.1", "0.5", "1.0"]
  const [slippage, setSlippage] = React.useState<string>("0.5")
  const [customSlippage, setCustomSlippage] = React.useState<boolean>(false)
  const [isOpen, setIsOpen] = React.useState(false)
  const [slider, setSlider] = React.useState([25])

  return (
    <div className="space-y-5 pt-5">
      <div className="space-y-5">
        <Slider
          defaultValue={slider}
          value={slider}
          step={25}
          max={100}
          onValueChange={(e) => setSlider(e)}
        />
        <div className="flex space-x-2 space-around">
          {[[25], [50], [75], [100]].map((value) => (
            <Button
              key={`slider-value-${value}`}
              className="bg-transparent text-primary rounded-full text-xs pt-[4px] pb-[2px] px-4 border-[1px] border-green-bangladesh"
              onClick={() => setSlider(value)}
            >
              {value}%
            </Button>
          ))}
        </div>
      </div>

      <Separator />
      <div className="flex justify-between items-baseline text-xs">
        <Label>Average market price</Label>
        <span>$0.00</span>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label>Slippage Tolerence</Label>

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
      </div>
      {customSlippage ? (
        <>
          <NumericInput
            className="w-full text-primary"
            value={slippage}
            placeholder="Custom"
            symbol={<Percent size="15" />}
          />
        </>
      ) : null}
      <Separator />

      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="w-full space-y-2 cursor-pointer text-xs"
      >
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Market details</h4>
            <Button variant="invisible" size="sm">
              <ChevronDown
                className={cn("h-4 w-4 transition-all", {
                  "rotate-180": isOpen,
                })}
              />

              <span className="sr-only">Toggle</span>
            </Button>
          </div>
        </CollapsibleTrigger>
        <div className="flex justify-between">
          <Label className="text-secondary">Taker fee</Label>
          <span>$ 0.00</span>
        </div>
        <CollapsibleContent className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-secondary">Tick size</Label>
            <span>$ 0.00</span>
          </div>
          <div className="flex justify-between">
            <Label className="text-secondary">Current spot price</Label>
            <span>$ 0.00</span>
          </div>
          <div className="flex justify-between">
            <Label className="text-secondary">Current spot price</Label>
            <span>$ 0.00</span>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
