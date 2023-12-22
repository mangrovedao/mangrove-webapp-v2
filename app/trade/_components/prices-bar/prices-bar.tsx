"use client"

import type { Token } from "@mangrovedao/mangrove.js"
import React from "react"

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import useTokenPriceQuery from "@/hooks/use-token-price-query"
import useMarket from "@/providers/market"
import { VariationArrow } from "@/svgs"
import { cn } from "@/utils"
import { determinePriceDecimalsFromToken, formatNumber } from "@/utils/numbers"

function Container({ children }: React.PropsWithChildren) {
  return <span className="text-xs font-medium space-y-[2px]">{children}</span>
}

function Label({ children }: React.PropsWithChildren) {
  return <div className="text-muted-foreground">{children}</div>
}

function Value({ children }: React.PropsWithChildren) {
  return <div className="flex items-center">{children}</div>
}

function Item({
  label,
  value,
  skeleton = true,
  showSymbol = false,
  quote,
  rightElement,
}: {
  label: string
  value?: number | bigint
  skeleton?: boolean
  showSymbol?: boolean
  quote?: Token
  rightElement?: React.ReactElement
}) {
  const displayedPriceDecimals = determinePriceDecimalsFromToken(value, quote)

  return (
    <Container>
      <Label>{label}</Label>
      {skeleton ? (
        <Skeleton className="w-16 h-4" />
      ) : value ? (
        <Value>
          {formatNumber(value ?? 0, {
            style: showSymbol ? "currency" : undefined,
            currencyDisplay: showSymbol ? "symbol" : undefined,
            currency: showSymbol ? "USD" : undefined,
            minimumFractionDigits: displayedPriceDecimals,
            maximumFractionDigits: displayedPriceDecimals,
          })}
          {rightElement}
        </Value>
      ) : (
        <span className="text-red">N/A</span>
      )}
    </Container>
  )
}

const keyLabels = {
  high: "24h High",
  low: "24h Low",
}

export function PricesBar() {
  const { market } = useMarket()
  const base = market?.base
  const quote = market?.quote
  const oneMinutePriceQuery = useTokenPriceQuery(base?.symbol, quote?.symbol)
  const oneDayPriceQuery = useTokenPriceQuery(base?.symbol, quote?.symbol, "1d")

  const oneMinuteClose = oneMinutePriceQuery?.data?.close ?? 0
  const oneDayClose = oneDayPriceQuery?.data?.close ?? 0
  const variationPercentage = (oneMinuteClose * 100) / oneDayClose - 100
  const variationPercentageAbs = Math.abs(variationPercentage)
  const variation24h = oneMinuteClose - oneDayClose

  return (
    <ScrollArea>
      <div className="flex items-center w-full space-x-8 whitespace-nowrap h-full min-h-[54px] px-4">
        <Item
          label={`Price (${quote?.symbol})`}
          value={oneMinutePriceQuery?.data?.close}
          skeleton={oneMinutePriceQuery?.isLoading}
          quote={quote}
        />

        <Separator orientation="vertical" className="h-4" />

        <Item
          label={`24h Change`}
          value={variation24h}
          quote={quote}
          skeleton={
            oneDayPriceQuery?.isLoading ?? oneMinutePriceQuery?.isLoading
          }
          rightElement={
            <span
              className={cn("space-x-[2px] text-xs inline-flex ml-2", {
                "text-green-caribbean": variation24h >= 0,
                "text-red-100": variation24h < 0,
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
              quote={quote}
              skeleton={oneDayPriceQuery?.isLoading}
            />
          </React.Fragment>
        ))}

        <Separator orientation="vertical" className="h-4" />

        <Item
          label="24h Volume"
          value={oneDayPriceQuery?.data?.volume}
          quote={quote}
          skeleton={oneDayPriceQuery?.isLoading}
        />
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
