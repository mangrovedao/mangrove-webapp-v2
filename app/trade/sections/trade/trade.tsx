"use client"
import React from "react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import useMarket from "@/providers/market"
import { CustomNumericInput } from "@components/stateless/custom-numeric-input"
import { Label } from "@components/ui/label"
import { LucideChevronRightCircle } from "lucide-react"
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
        {/* Switch Input*/}
        <Tabs
          defaultValue="buy"
          className="pt-5"
          onValueChange={(e) => console.log(e)}
        >
          <TabsList className="w-full h-10 rounded-3xl">
            <TabsTrigger value="buy" className="w-full h-8 rounded-3xl">
              Buy
            </TabsTrigger>
            <TabsTrigger value="sell" className="w-full h-8 rounded-3xl">
              Sell
            </TabsTrigger>
          </TabsList>
        </Tabs>

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
        {marketType === "Limit" ? <LimitOrder /> : null}
        {marketType === "Market" ? <MarketOrder /> : null}

        <Button className="w-full bg-green hover:bg-transparent hover:border hover:border-green hover:text-primary">
          Buy <LucideChevronRightCircle className="ml-2" />
        </Button>
      </div>
    </div>
  )
}
