"use client"
import type { Market } from "@mangrovedao/mangrove.js"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import useMangrove from "@/providers/mangrove"
import useMarket from "@/providers/market"

function getName(market?: Market) {
  if (!market) return
  return `${market?.base?.name}/${market?.quote?.name}`
}

function getValue(market: Market) {
  return `${market.base.address}/${market.quote.address}`
}

export default function MarketSelector() {
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

  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      disabled={marketsQuery.isLoading}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a market" />
      </SelectTrigger>
      <SelectContent>
        {marketsQuery.data?.map((market) => (
          <SelectItem
            key={`${market.base.address}/${market.quote.address}`}
            value={getValue(market)}
          >
            {getName(market)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
