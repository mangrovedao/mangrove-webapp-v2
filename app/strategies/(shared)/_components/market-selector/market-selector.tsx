"use client"
import { useAccount } from "wagmi"
import { Address } from "viem"
import { useRouter } from "next/navigation"
import { MarketParams } from "@mangrovedao/mgv"

import { TokenIcon } from "@/components/token-icon"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import useMarket from "@/providers/market.new"
import { useTokenFromAddress } from "@/hooks/use-token-from-address"

function getSymbol(market?: MarketParams) {
  if (!market) return
  return `${market?.base?.symbol}/${market?.quote?.symbol}`
}

function getValue(market: MarketParams) {
  return `${market.base.address}/${market.quote.address}`
}

export default function MarketSelector({ disabled }: { disabled?: boolean }) {
  const router = useRouter()
  const { currentMarket, markets } = useMarket()
  const { isConnected } = useAccount()
    // note-SDK: add token id in currentMarket tokens
    const { isLoading: baseLoading, data: baseToken}  = useTokenFromAddress(currentMarket?.base.address || "" as Address)
    const { isLoading: quoteLoading, data: quoteToken} = useTokenFromAddress(currentMarket?.base.address || "" as Address)

  const onValueChange = (value: string) => {
    router.push(`?market=${baseToken?.id},${quoteToken?.id}`, {
    scroll: false,
    })
  }

  return (
    <Select
      value={
        currentMarket
          ? `${currentMarket?.base.address}/${currentMarket?.quote.address}`
          : undefined
      }
      onValueChange={onValueChange}
      disabled={
        quoteLoading || baseLoading ||  !currentMarket || !isConnected || disabled
      }
    >
      <SelectTrigger className="p-0 rounded-none bg-transparent text-sm !border-transparent">
        <SelectValue
          placeholder={!currentMarket ? "Select a market" : "No markets"}
          suppressHydrationWarning
        />
      </SelectTrigger>
      <SelectContent>
        {markets?.map((m) => (
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
