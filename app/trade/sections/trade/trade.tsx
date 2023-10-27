"use client"
import { SlippageSettings } from "./components/slippage-settings"
import TradeInputs from "./components/trade-inputs"

export default function Trade() {
  return (
    <div>
      <TradeInputs />
      <SlippageSettings />
    </div>
  )
}
