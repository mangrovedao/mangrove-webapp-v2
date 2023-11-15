"use client"

import MarketSelector from "@/components/stateful/market-selector"
import MarketInfoBar from "../../components/market-infos-bar"

export default function Header() {
  return (
    <div className="p-1 grid grid-cols-4 gap-4">
      <div className="px-4 py-[15px]">
        <MarketSelector />
      </div>
      <div className="col-span-3">
        <MarketInfoBar />
      </div>
    </div>
  )
}
