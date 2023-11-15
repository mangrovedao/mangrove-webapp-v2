"use client"

import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import useTokenPriceQuery from "@/hooks/use-token-price-query"
import useMarket from "@/providers/market"
import { formatNumber } from "@/utils/numbers"

function Container({ children }: React.PropsWithChildren) {
  return <span className="text-xs font-medium space-y-[2px]">{children}</span>
}

function Label({ children }: React.PropsWithChildren) {
  return <div className="text-muted-foreground">{children}</div>
}

function Value({ children }: React.PropsWithChildren) {
  return <div className="">{children}</div>
}

function Item({
  label,
  value,
  skeleton = true,
  decimals = 2,
}: {
  label: string
  value?: number | bigint
  skeleton?: boolean
  decimals?: number
}) {
  return (
    <Container>
      <Label>{label}</Label>
      {!skeleton ? (
        <Value>
          {formatNumber(value ?? 0, {
            style: "currency",
            currencyDisplay: "symbol",
            currency: "USD",
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          })}
        </Value>
      ) : (
        <Skeleton className="w-16 h-4" />
      )}
    </Container>
  )
}

export default function MarketInfosBar() {
  const { selectedMarket } = useMarket()
  const oneMinutePriceQuery = useTokenPriceQuery(
    selectedMarket?.base.name,
    selectedMarket?.quote.name,
  )
  const displayedDecimals = selectedMarket?.quote.displayedDecimals || 2

  const props = {
    value: oneMinutePriceQuery?.data?.close,
    decimals: displayedDecimals,
    skeleton: oneMinutePriceQuery?.isLoading,
  }

  return (
    <div className="flex items-center w-full space-x-8 whitespace-nowrap h-full">
      <Item label="Price" {...props} />

      <Separator orientation="vertical" className="h-4" />

      <Container>
        <Label>24h change</Label>
        <Value>21.36 +0.2%</Value>
      </Container>

      <Separator orientation="vertical" className="h-4" />

      <Container>
        <Label>24h high</Label>
        <Value>1 234.12</Value>
      </Container>

      <Separator orientation="vertical" className="h-4" />

      <Container>
        <Label>24h low</Label>
        <Value>1 234.12</Value>
      </Container>

      <Separator orientation="vertical" className="h-4" />

      <Container>
        <Label>24h volume (ETH)</Label>
        <Value>123 456.12</Value>
      </Container>

      <Separator orientation="vertical" className="h-4" />

      <Container>
        <Label>24h volume (USDC)</Label>
        <Value>123 456.12</Value>
      </Container>
    </div>
  )
}
