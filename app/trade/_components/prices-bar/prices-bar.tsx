"use client"

import type { Token } from "@mangrovedao/mgv"
import React from "react"

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useBook } from "@/hooks/use-book"
import useMangroveTokenPricesQuery from "@/hooks/use-mangrove-token-price-query"
import useMarket from "@/providers/market"
import { VariationArrow } from "@/svgs"
import { cn } from "@/utils"
import { determineDecimals, formatNumber } from "@/utils/numbers"

function Container({ children }: React.PropsWithChildren) {
  return <span className="text-xs font-medium space-y-[2px]">{children}</span>
}

function Label({ children }: React.PropsWithChildren) {
  return <div className="text-muted-foreground">{children}</div>
}

function Value({
  children,
  className,
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={cn(
        "flex items-center font-ubuntu font-semibold text-sm",
        className,
      )}
    >
      {children}
    </div>
  )
}

function Item({
  label,
  value,
  className,
  skeleton = true,
  showSymbol = false,
  token,
  rightElement,
}: {
  label: string
  value?: number | bigint
  skeleton?: boolean
  showSymbol?: boolean
  token?: Token
  rightElement?: React.ReactElement
  className?: string
}) {
  const displayedPriceDecimals = determineDecimals(
    value,
    token?.priceDisplayDecimals,
  )

  return (
    <Container>
      <Label>{label}</Label>
      {skeleton ? (
        <Skeleton className="w-16 h-4" />
      ) : value ? (
        <Value className={className}>
          {formatNumber(value ?? 0, {
            style: showSymbol ? "currency" : undefined,
            currencyDisplay: showSymbol ? "symbol" : undefined,
            currency: showSymbol ? "USD" : undefined,
            minimumFractionDigits: displayedPriceDecimals,
            maximumFractionDigits: displayedPriceDecimals,
          })}{" "}
          {token?.symbol}
          {rightElement}
        </Value>
      ) : (
        <span>-</span>
      )}
    </Container>
  )
}

export function PricesBar() {
  const { currentMarket } = useMarket()
  const base = currentMarket?.base
  const quote = currentMarket?.quote
  const tickSpacing = currentMarket?.tickSpacing
  const { data, isLoading: mangroveTokenPriceLoading } =
    useMangroveTokenPricesQuery(
      base?.address,
      quote?.address,
      Number(tickSpacing),
    )

  const [side, setSide] = React.useState<"base" | "quote">("base")

  const token = side === "base" ? quote : base

  const { book } = useBook({})
  const lowestAskPrice = book?.asks[0]?.price
  const highestBidPrice = book?.bids[0]?.price

  let spotPrice =
    lowestAskPrice && highestBidPrice
      ? (lowestAskPrice + (highestBidPrice ?? 0)) / 2
      : !lowestAskPrice && !highestBidPrice
        ? undefined
        : Math.max(lowestAskPrice || 0, highestBidPrice || 0)

  if (side === "quote") {
    spotPrice = 1 / (spotPrice ?? 1)
  }

  const variation24hPercentage =
    ((Number(data?.close) - Number(data?.open)) / Number(data?.close)) * 100

  const variation24hClassnames = cn({
    "text-green-caribbean": variation24hPercentage >= 0,
    "text-red-100": variation24hPercentage < 0,
  })

  return (
    <ScrollArea>
      <div className="flex items-center w-full space-x-8 whitespace-nowrap h-full min-h-[54px] px-4">
        <Item
          label={"Price"}
          value={spotPrice ? Number(spotPrice ?? 0) : undefined}
          token={side === "quote" ? base : quote}
          skeleton={false}
        />

        <Separator orientation="vertical" className="h-4" />

        <Item
          label={`24h Change`}
          value={variation24hPercentage}
          token={token}
          skeleton={mangroveTokenPriceLoading}
          className={variation24hClassnames}
          rightElement={
            <span
              className={cn(
                "space-x-[2px] text-xs inline-flex ml-2",
                variation24hClassnames,
              )}
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
          value={data?.maxPrice ? Number(data?.maxPrice ?? 0) : undefined}
          token={token}
          skeleton={mangroveTokenPriceLoading}
        />

        <Item
          label="24h Low"
          value={data?.minPrice ? Number(data?.minPrice ?? 0) : undefined}
          token={token}
          skeleton={mangroveTokenPriceLoading}
        />

        <Separator orientation="vertical" className="h-4" />

        <Item
          label="24h Volume"
          value={data?.quoteVolume ? Number(data?.quoteVolume ?? 0) : undefined}
          token={token}
          skeleton={mangroveTokenPriceLoading}
        />

        {/* <Button
          variant={"secondary"}
          size={"icon"}
          className="p-1"
          onClick={() => {
            setSide(side === "base" ? "quote" : "base")
          }}
        >
          <ArrowLeftRight />
        </Button> */}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
