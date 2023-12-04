"use client"
import type { Market } from "@mangrovedao/mangrove.js"
import React from "react"
import { useAccount } from "wagmi"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import useMangrove from "@/providers/mangrove"
import useMarket from "@/providers/market"
import { TokenIcon } from "../token-icon"

function getName(market?: Market) {
  if (!market) return
  return `${market?.base?.name}/${market?.quote?.name}`
}

function getValue(market: Market) {
  return `${market.base.address}/${market.quote.address}`
}

export default function MarketSelector() {
  const { isConnected } = useAccount()
  const { marketsQuery } = useMangrove()
  const { selectedMarket, setSelectedMarket } = useMarket()

  const onValueChange = (value: string) => {
    const [baseAddress, quoteAddress] = value.split("/")
    const market = marketsQuery.data?.find(
      ({ base, quote }) =>
        base.address === baseAddress && quote.address === quoteAddress,
    )
    setSelectedMarket(market)
  }

  const value = selectedMarket ? getValue(selectedMarket) : undefined
  const [selectPlaceholder, setSelectPlaceholder] = React.useState("")

  React.useEffect(() => {
    setSelectPlaceholder(
      !isConnected
        ? "Connect wallet"
        : !marketsQuery
          ? "Select a market"
          : "Empty Markets",
    )
  }, [isConnected, marketsQuery])

  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      disabled={marketsQuery.isLoading || !selectedMarket || !isConnected}
    >
      <SelectTrigger className="p-0 rounded-none bg-transparent text-sm !border-transparent">
        <SelectValue placeholder={selectPlaceholder} />
      </SelectTrigger>
      <SelectContent>
        {marketsQuery.data?.map((market) => (
          <SelectItem
            key={`${market.base.address}/${market.quote.address}`}
            value={getValue(market)}
          >
            <div className="flex items-center space-x-2">
              <div className="flex -space-x-2">
                <TokenIcon symbol={market.base.name} />
                <TokenIcon symbol={market.quote.name} />
              </div>
              <span>{getName(market)}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
