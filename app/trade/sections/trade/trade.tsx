"use client"
import React from "react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CustomNumericInput } from "@components/stateless/custom-numeric-input"
import { Label } from "@components/ui/label"
import LimitOrder from "./components/limit-order"
import MarketOrder from "./components/market-order"
import Menu from "./components/menu"

export default function TradeInputs() {
  const [marketTytpe, setMarketType] = React.useState("Market")

  return (
    <div>
      <Menu marketType={marketTytpe} setMarketType={setMarketType} />
      <Separator />
      <div className="px-4 space-y-4">
        <Tabs defaultValue="buy" className="pt-5">
          <TabsList className="w-full h-[3.5rem] p-2 rounded-lg">
            <TabsTrigger value="buy" className="w-full h-[2.5rem] rounded-lg">
              Buy
            </TabsTrigger>
            <TabsTrigger value="sell" className="w-full h-[2.5rem] rounded-lg">
              Sell
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div>
          <Label> Buy amount</Label>
          <CustomNumericInput icon="ETH" />
          <span className="pt-2 text-xs float-right ">
            Balance: {"1234.12"} {"ETH"}
          </span>
        </div>
        <div>
          <Label> Pay amount</Label>

          <CustomNumericInput icon="USDC" />
          <span className="pt-2 text-xs float-right ">
            Balance: {"1234.12"} {"USDC"}
          </span>
        </div>
        {marketTytpe === "Limit" ? <LimitOrder /> : null}
        {marketTytpe === "Market" ? <MarketOrder /> : null}
        <Button className="w-full">Buy</Button>
      </div>
    </div>
  )
}
