"use client"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import useTokenPriceQuery from "@/hooks/use-token-price-query"
import useMarket from "@/providers/market"
import { formatNumber } from "@/utils/numbers"
import React from "react"

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
  showSymbol = false,
}: {
  label: string
  value?: number | bigint
  skeleton?: boolean
  decimals?: number
  showSymbol?: boolean
}) {
  return (
    <Container>
      <Label>{label}</Label>
      {!skeleton ? (
        <Value>
          {formatNumber(value ?? 0, {
            style: showSymbol ? "currency" : undefined,
            currencyDisplay: showSymbol ? "symbol" : undefined,
            currency: showSymbol ? "USD" : undefined,
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

const keyLabels = {
  high: "24h High",
  low: "24h Low",
}

export default function MarketInfosBar() {
  const { selectedMarket } = useMarket()
  const oneMinutePriceQuery = useTokenPriceQuery(
    selectedMarket?.base.name,
    selectedMarket?.quote.name,
  )
  const oneDayPriceQuery = useTokenPriceQuery(
    selectedMarket?.base.name,
    selectedMarket?.quote.name,
    "1d",
  )
  const displayedDecimals = selectedMarket?.quote.displayedDecimals
  const quoteName = selectedMarket?.quote.name

  return (
    <div className="flex items-center w-full space-x-8 whitespace-nowrap h-full">
      <Item
        label="Price"
        value={oneMinutePriceQuery?.data?.close}
        decimals={displayedDecimals}
        skeleton={oneMinutePriceQuery?.isLoading}
        showSymbol
      />

      {Object.entries(keyLabels).map(([key, label]) => (
        <React.Fragment key={key}>
          <Separator orientation="vertical" className="h-4" />

          <Item
            label={label}
            value={oneDayPriceQuery?.data?.[key as keyof typeof keyLabels]}
            decimals={displayedDecimals}
            skeleton={oneDayPriceQuery?.isLoading}
          />
        </React.Fragment>
      ))}

      <Separator orientation="vertical" className="h-4" />

      <Item
        label={`24h Volume (${quoteName})`}
        value={oneDayPriceQuery?.data?.volume}
        decimals={displayedDecimals}
        skeleton={oneDayPriceQuery?.isLoading}
      />
    </div>
  )
}
