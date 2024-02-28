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
import { useCurrentTradeTab } from "@/stores/trade-type"
import { useRouter } from "next/navigation"
import { TokenIcon } from "../../../../components/token-icon"

function getSymbol(market?: Mangrove.OpenMarketInfo) {
  if (!market) return
  return `${market?.base?.symbol}/${market?.quote?.symbol}`
}

function getValue(market: Mangrove.OpenMarketInfo) {
  return `${market.base.address}/${market.quote.address}`
}

export default function MarketSelector() {
  const { currentTab } = useCurrentTradeTab()
  const router = useRouter()
  const { marketsInfoQuery } = useMangrove()
  const { marketInfo } = useMarket()
  const { isConnected } = useAccount()

  const onValueChange = (value: string) => {
    const [baseAddress, quoteAddress] = value.split("/")
    const marketInfo = marketsInfoQuery.data?.find(
      ({ base, quote }) =>
        base.address === baseAddress && quote.address === quoteAddress,
    )
    router.push(`?market=${marketInfo?.base.id},${marketInfo?.quote.id}`, {
      scroll: false,
    })
  }

  return (
    <Select
      value={
        marketInfo
          ? `${marketInfo?.base.address}/${marketInfo?.quote.address}`
          : undefined
      }
      onValueChange={onValueChange}
      disabled={marketsInfoQuery.isLoading || !marketInfo || !isConnected}
    >
      <SelectTrigger className="p-0 rounded-none bg-transparent text-sm !border-transparent">
        <SelectValue
          placeholder={!marketInfo ? "Select a market" : "No markets"}
          suppressHydrationWarning
        />
      </SelectTrigger>
      <SelectContent>
        {marketsInfoQuery.data?.map((m) => (
          <SelectItem
            key={`${m.base.address}/${m.quote.address}`}
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
