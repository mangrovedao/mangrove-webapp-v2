"use client"

import React from "react"

import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import useTokenPriceQuery from "@/hooks/use-token-price-query"
import useMarket from "@/providers/market"
import { VariationArrow } from "@/svgs"
import { cn } from "@/utils"
import {
  determinePriceDecimalsFromTokenName,
  formatNumber,
} from "@/utils/numbers"

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
  showSymbol = false,
  quoteName,
  rightElement,
}: {
  label: string
  value?: number | bigint
  skeleton?: boolean
  showSymbol?: boolean
  quoteName?: string
  rightElement?: React.ReactElement
}) {
  const showPlaceholder = skeleton && !value && !quoteName
  const displayedPriceDecimals = determinePriceDecimalsFromTokenName(
    value,
    quoteName,
  )

  return (
    <Container>
      <Label>{label}</Label>
      {showPlaceholder ? (
        <Skeleton className="w-16 h-4" />
      ) : value ? (
        <Value>
          <div className="flex items-center">
            {formatNumber(value ?? 0, {
              style: showSymbol ? "currency" : undefined,
              currencyDisplay: showSymbol ? "symbol" : undefined,
              currency: showSymbol ? "USD" : undefined,
              minimumFractionDigits: displayedPriceDecimals,
              maximumFractionDigits: displayedPriceDecimals,
            })}
            {rightElement}
          </div>
        </Value>
      ) : (
        <span className="text-red">unk</span>
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
  const quoteName = selectedMarket?.quote.name

  const oneMinuteClose = oneMinutePriceQuery?.data?.close ?? 0
  const oneDayClose = oneDayPriceQuery?.data?.close ?? 0
  const variationPercentage = (oneMinuteClose * 100) / oneDayClose - 100
  const variationPercentageAbs = Math.abs(variationPercentage)
  const variation24h = oneMinuteClose - oneDayClose

  return (
    <div className="flex items-center w-full space-x-8 whitespace-nowrap h-full">
      <Item
        label="Price"
        value={oneMinutePriceQuery?.data?.close}
        skeleton={oneMinutePriceQuery?.isLoading}
        quoteName={selectedMarket?.quote.name}
        showSymbol
      />

      <Separator orientation="vertical" className="h-4" />

      <Item
        label={`24h Change`}
        value={variation24h}
        quoteName={selectedMarket?.quote.name}
        skeleton={oneDayPriceQuery?.isLoading || oneMinutePriceQuery?.isLoading}
        rightElement={
          <span
            className={cn("space-x-[2px] text-xs inline-flex ml-2", {
              "text-green-500": variation24h >= 0,
              "text-red-500": variation24h < 0,
            })}
          >
            <VariationArrow
              className={cn("h-3", {
                "rotate-180": variation24h < 0,
              })}
            />
            <span>
              {new Intl.NumberFormat(undefined, {
                style: "percent",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(variationPercentageAbs / 100)}
            </span>
          </span>
        }
      />

      {Object.entries(keyLabels).map(([key, label]) => (
        <React.Fragment key={key}>
          <Separator orientation="vertical" className="h-4" />

          <Item
            label={label}
            value={oneDayPriceQuery?.data?.[key as keyof typeof keyLabels]}
            quoteName={selectedMarket?.quote.name}
            skeleton={oneDayPriceQuery?.isLoading}
          />
        </React.Fragment>
      ))}

      <Separator orientation="vertical" className="h-4" />

      <Item
        label={quoteName ? `24h Volume (${quoteName})` : `24h Volume`}
        value={oneDayPriceQuery?.data?.volume}
        quoteName={selectedMarket?.quote.name}
        skeleton={oneDayPriceQuery?.isLoading}
      />
    </div>
  )
}
