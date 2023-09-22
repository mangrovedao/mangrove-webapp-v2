import { Info, Percent } from "lucide-react"
import React from "react"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CustomNumericInput } from "@components/stateless/custom-numeric-input"
import { Label } from "@components/ui/label"
import { Separator } from "@components/ui/separator"
import { Switch } from "@components/ui/switch"
import * as Root from "@components/ui/tooltip"

const InfoContent = (
  <div className="p-2 space-y-2 prose max-w-sm">
    <h3>Slippage</h3>
    <div className="grid space-y-2 ">
      <p className="text-xs">
        Slippage Slippage is the difference between the expected value of output
        from a trade and the actual value due to asset volatility and liquidity
        depth. If the actual slippage falls outside of the user-designated
        range, the transaction will revert.
      </p>

      <a
        href="https://docs.mangrove.exchange/web-app/trade/more-on-order-types#market-order"
        target="_blank"
        className="hover:underline"
      >
        Learn more.
      </a>
    </div>
  </div>
)

export function SlippageSettings() {
  const slippageOptions = ["0.1", "0.5", "1.0"]
  const [slippage, setSlippage] = React.useState<string>("0.5")
  const [hideControls, sethideControls] = React.useState<boolean>(true)

  const toggleAutoSlippage = () => {
    sethideControls(!hideControls)
    if (!hideControls) setSlippage("0.5")
  }
  return (
    <div className="space-y-2 bg-gray-600 rounded-md p-4 overflow-hidden">
      <h1 className="font-semibold">Automatic Slippage Tolerence</h1>

      <div className="flex justify-between">
        <p className="text-xs">
          Turn off automatic slippage tolerance to adjust the value.
        </p>
        <Switch checked={hideControls} onCheckedChange={toggleAutoSlippage} />
      </div>

      <Separator />

      <div className="flex justify-between">
        <div className="flex space-x-1.5 items-center">
          <h1 className="font-semibold">Slippage</h1>
          <Root.TooltipProvider>
            <Root.Tooltip>
              <Root.TooltipTrigger asChild>
                <Info size="15" className="hover:fill-secondary" />
              </Root.TooltipTrigger>
              <Root.TooltipContent>{InfoContent}</Root.TooltipContent>
            </Root.Tooltip>
          </Root.TooltipProvider>
        </div>

        <p>{slippage}%</p>
      </div>
      {!hideControls ? (
        <div className="flex items-center space-x-5 px-2 py-1 rounded-xl bg-secondary border-primary border-1">
          <RadioGroup
            defaultValue={slippage}
            onValueChange={(e) => setSlippage(e)}
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
          </RadioGroup>

          <Separator orientation="vertical" className="bg-primary h-[1.5rem]" />

          {/* @Anas note: check numeric input */}
          <CustomNumericInput
            className="w-full border-primary bg-secondary text-primary focus:bg-primary focus:text-secondary hover:bg-muted-foreground"
            onUserInput={setSlippage}
            value={slippage}
            placeholder="Custom"
            icon={<Percent size="15" />}
          />
        </div>
      ) : undefined}
    </div>
  )
}
