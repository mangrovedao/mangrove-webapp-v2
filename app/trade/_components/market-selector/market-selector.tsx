"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import useMarket from "@/providers/market"
import { MarketParams } from "@mangrovedao/mgv"
import { getAddress, isAddressEqual } from "viem"
import { TokenIcon } from "../../../../components/token-icon"

function getSymbol(market?: MarketParams) {
  if (!market) return
  return `${market.base.symbol}/${market.quote.symbol}`
}

function getValue(market: MarketParams) {
  return `${market.base.address}/${market.quote.address}/${market.tickSpacing}`
}

export default function MarketSelector() {
  const { markets, currentMarket, setMarket } = useMarket()

  const onValueChange = (value: string) => {
    const [baseAddress, quoteAddress, tickSpacing] = value.split("/")
    if (!baseAddress || !quoteAddress || !tickSpacing) return
    try {
      const market = markets.find(
        (m) =>
          isAddressEqual(m.base.address, getAddress(baseAddress)) &&
          isAddressEqual(m.quote.address, getAddress(quoteAddress)) &&
          m.tickSpacing === BigInt(tickSpacing),
      )
      if (!market) return
      setMarket(market)
    } catch (e) {}
  }

  return (
    <Select
      value={
        currentMarket
          ? `${currentMarket.base.address}/${currentMarket.quote.address}/${currentMarket.tickSpacing}`
          : undefined
      }
      onValueChange={onValueChange}
      disabled={!markets.length}
    >
      <SelectTrigger className="">
        <SelectValue
          placeholder={!markets.length ? "Select a market" : "No markets"}
          suppressHydrationWarning
        />
      </SelectTrigger>
      <SelectContent>
        {markets.map((m) => (
          <SelectItem
            key={`${m.base.address}/${m.quote.address}/${m.tickSpacing}`}
            value={getValue(m)}
          >
            <div className="flex items-center space-x-2">
              <div className="flex -space-x-2">
                <TokenIcon symbol={m.base.symbol} />
                <TokenIcon symbol={m.quote.symbol} />
              </div>
              <span>{getSymbol(m)}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
