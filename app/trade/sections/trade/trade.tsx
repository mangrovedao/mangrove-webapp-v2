"use client"
import React from "react"

import {
  CustomRadioGroup,
  CustomRadioGroupItem,
} from "@/components/stateless/custom-radio-group"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import useMarket from "@/providers/market"
import { CustomNumericInput } from "@components/stateless/custom-numeric-input"
import { Label } from "@components/ui/label"
import { LucideChevronRight } from "lucide-react"
import LimitOrder from "./components/limit-order"
import MarketOrder from "./components/market-order"
import Menu from "./components/menu"

export default function TradeInputs({
  className,
}: React.ComponentProps<"div">) {
  const [marketType, setMarketType] = React.useState("Market")
  const { selectedMarket } = useMarket()

  return (
    <div className={className}>
      {/* Menu */}
      <Menu marketType={marketType} setMarketType={setMarketType} />
      <Separator />
      <div className="px-4 space-y-8">
        {/* Radio Input*/}
        <CustomRadioGroup defaultValue="Buy" className="mt-4">
          <div className="flex justify-center w-full">
            <CustomRadioGroupItem value="Buy" id="r1">
              <Label htmlFor="r1">Buy</Label>
            </CustomRadioGroupItem>
          </div>
          <div className="flex justify-center w-full">
            <CustomRadioGroupItem value="Sell" id="r2">
              <Label htmlFor="r2">Sell</Label>
            </CustomRadioGroupItem>
          </div>
        </CustomRadioGroup>

        <div>
          {/* Buy Input*/}
          <Label> Send amount</Label>
          <CustomNumericInput
            icon={selectedMarket?.base.name}
            symbol={selectedMarket?.base.name}
            className="h-[3rem] rounded-xl"
          />
          <span className="pt-2 text-xs text-secondary float-left">
            Balance:
          </span>
          <span className="pt-2 text-xs float-right">
            {"1234.12"} {selectedMarket?.base.name}
          </span>
        </div>

        <div>
          {/* Pay Input */}
          <Label> Receive amount</Label>
          <CustomNumericInput
            icon={selectedMarket?.quote.name}
            symbol={selectedMarket?.quote.name}
            className="h-[3rem] rounded-xl"
          />
          <span className="pt-2 text-xs text-secondary float-left">
            Balance:
          </span>
          <span className="pt-2 text-xs float-right">
            {"1234.12"} {selectedMarket?.quote.name}
          </span>
        </div>

        {/* Conditional Inputs */}
        {marketType === "Limit" && <LimitOrder />}
        {marketType === "Market" && <MarketOrder />}

        <Button className="w-full flex items-center justify-center" size={"lg"}>
          Buy
          <div className="ml-2 bg-white h-6 w-6 rounded-full text-secondary flex items-center justify-center">
            <LucideChevronRight className="h-4 text-current" />
          </div>
        </Button>
      </div>
    </div>
  )
}
