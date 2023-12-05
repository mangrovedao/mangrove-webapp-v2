"use client"
import type { Mangrove } from "@mangrovedao/mangrove.js"
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

function getSymbol(market?: Mangrove.OpenMarketInfo) {
  if (!market) return
  return `${market?.base?.symbol}/${market?.quote?.symbol}`
}

function getValue(market: Mangrove.OpenMarketInfo) {
  return `${market.base.address}/${market.quote.address}`
}

export default function MarketSelector() {
  const { marketsInfoQuery } = useMangrove()
  const { market, setMarketInfo } = useMarket()
  const { isConnected } = useAccount()

  const onValueChange = (value: string) => {
    const [baseAddress, quoteAddress] = value.split("/")
    const marketInfo = marketsInfoQuery.data?.find(
      ({ base, quote }) =>
        base.address === baseAddress && quote.address === quoteAddress,
    )
    setMarketInfo(marketInfo)
  }

  const value = market ? getValue(market) : undefined

  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      disabled={marketsInfoQuery.isLoading || !market || !isConnected}
    >
      <SelectTrigger className="p-0 rounded-none bg-transparent text-sm !border-transparent">
        <SelectValue
          placeholder={
            !isConnected
              ? "Connect wallet"
              : !market
                ? "Select a market"
                : "No markets"
          }
        />
      </SelectTrigger>
      <SelectContent>
        {marketsInfoQuery.data?.map((market) => (
          <SelectItem
            key={`${market.base.address}/${market.quote.address}`}
            value={getValue(market)}
          >
            <div className="flex items-center space-x-2">
              <div className="flex -space-x-2">
                <TokenIcon symbol={market.base.symbol} />
                <TokenIcon symbol={market.quote.symbol} />
              </div>
              <span>{getSymbol(market)}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
