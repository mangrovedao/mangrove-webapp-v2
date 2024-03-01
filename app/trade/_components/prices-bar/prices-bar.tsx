"use client"

import type { Token } from "@mangrovedao/mangrove.js"
import React from "react"

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import useMangroveTokenPricesQuery from "@/hooks/use-mangrove-token-price-query"
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

export function PricesBar() {
  const { market, requestBookQuery } = useMarket()
  const base = market?.base
  const quote = market?.quote
  const oneMinutePriceQuery = useTokenPriceQuery(base?.symbol, quote?.symbol)
  const oneDayPriceQuery = useTokenPriceQuery(base?.symbol, quote?.symbol, "1d")
  const { data, isLoading: mangroveTokenPriceLoading } =
    useMangroveTokenPricesQuery(base?.address, quote?.address)

  const { diffTakerGave, takerGave, minPrice, maxPrice } =
    data?.[`${base?.address}-${quote?.address}`] ?? {}

  const { asks, bids } = requestBookQuery.data ?? {}

  const lowestAskPrice = asks?.[0]?.price
  const highestBidPrice = bids?.[0]?.price
  const priceDecimals = determinePriceDecimalsFromToken(
    lowestAskPrice?.toNumber(),
    market?.quote,
  )
  const spotPrice =
    !lowestAskPrice || !highestBidPrice
      ? undefined
      : Math.max(
          lowestAskPrice?.toNumber() || 0,
          highestBidPrice?.toNumber() || 0,
        )

  const fixedSpotPrice = spotPrice?.toFixed(priceDecimals)

  const variation24hPercentage = (diffTakerGave ?? 0 * 100) / (spotPrice ?? 1)

  return (
    <ScrollArea>
      <div className="flex items-center w-full space-x-8 whitespace-nowrap h-full min-h-[54px] px-4">
        <Item
          label={quote?.symbol ? `Price (${quote?.symbol})` : "Price"}
          value={fixedSpotPrice ? Number(fixedSpotPrice ?? 0) : undefined}
          skeleton={oneMinutePriceQuery?.isLoading}
          quote={quote}
        />

        <Separator orientation="vertical" className="h-4" />

        <Item
          label={`24h Change`}
          value={diffTakerGave}
          quote={quote}
          skeleton={mangroveTokenPriceLoading}
          rightElement={
            <span
              className={cn("space-x-[2px] text-xs inline-flex ml-2", {
                "text-green-caribbean": variation24hPercentage >= 0,
                "text-red-100": variation24hPercentage < 0,
              })}
            >
              <VariationArrow
                className={cn("h-3", {
                  "rotate-180": variation24hPercentage < 0,
                })}
              />
              <span>
                {new Intl.NumberFormat(undefined, {
                  style: "percent",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(variation24hPercentage / 100)}
              </span>
            </span>
          }
        />

        <Item
          label="24h High"
          value={maxPrice ? Number(maxPrice ?? 0) : undefined}
          quote={quote}
          skeleton={mangroveTokenPriceLoading}
        />

        <Item
          label="24h Low"
          value={minPrice ? Number(minPrice ?? 0) : undefined}
          quote={quote}
          skeleton={mangroveTokenPriceLoading}
        />

        <Separator orientation="vertical" className="h-4" />

        <Item
          label="24h Volume"
          value={takerGave ? Number(takerGave ?? 0) : undefined}
          quote={quote}
          skeleton={mangroveTokenPriceLoading}
        />
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
