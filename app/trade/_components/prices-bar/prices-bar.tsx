"use client"

import type { Token } from "@mangrovedao/mgv"
import { useQuery } from "@tanstack/react-query"
import { AnimatePresence, motion } from "framer-motion"
import React from "react"

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { useBook } from "@/hooks/use-book"
import { useDefaultChain } from "@/hooks/use-default-chain"
import useMarket from "@/providers/market"
import { VariationArrow } from "@/svgs"
import { cn } from "@/utils"
import { determineDecimals, formatNumber } from "@/utils/numbers"

function Container({ children }: React.PropsWithChildren) {
  return <span className="text-xs font-medium space-y-2 block">{children}</span>
}

function Label({ children }: React.PropsWithChildren) {
  return (
    <div className="text-muted-foreground h-2 text-xs font-light">
      {children}
    </div>
  )
}

function Value({
  children,
  className,
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={cn(
        "flex items-center font-light text-xs h-2 text-nowrap",
        className,
      )}
    >
      {children}
    </div>
  )
}

// Animation variants for number transitions
const numberVariants = {
  initial: { opacity: 0, y: 5 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -5 },
}

// Animation variants for loading
const loadingVariants = {
  animate: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
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

  // Check if value is valid (not undefined, NaN, or null)
  const isValidValue =
    value !== undefined && value !== null && !isNaN(Number(value))

  // Format the value outside of the render to ensure consistent width
  let formattedValue = "-"
  if (isValidValue) {
    try {
      formattedValue = formatNumber(value ?? 0, {
        style: showSymbol ? "currency" : undefined,
        currencyDisplay: showSymbol ? "symbol" : undefined,
        currency: showSymbol ? "USD" : undefined,
        minimumFractionDigits: displayedPriceDecimals,
        maximumFractionDigits: displayedPriceDecimals,
      })
    } catch (error) {
      console.error("Error formatting value:", error)
      formattedValue = "-"
    }
  }

  return (
    <Container>
      <Label>{label}</Label>
      <div className="h-4 flex items-center font-sans text-xs">
        {skeleton ? (
          <motion.div
            variants={loadingVariants}
            animate="animate"
            className="flex items-center"
          >
            <Skeleton className="w-16 h-4 ml-1" />
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.div
              key={`${formattedValue}-${token?.symbol || ""}`}
              initial="initial"
              animate="animate"
              exit="exit"
              variants={numberVariants}
              transition={{ duration: 0.2 }}
            >
              <Value className={className}>
                {formattedValue} {isValidValue && token?.symbol && token.symbol}
                {isValidValue && rightElement}
              </Value>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </Container>
  )
}

// Price fetching hook
export function useTokenPrice(tokenAddress: string, chainId: number) {
  return useQuery({
    queryKey: ["tokenPrice", tokenAddress, chainId],
    queryFn: async () => {
      if (!tokenAddress) return null

      return null

      // const response = await fetch(
      //   `https://api.coingecko.com/api/v3/simple/token_price/${chainId}?contract_addresses=${tokenAddress}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`,
      // )

      // if (!response.ok) {
      //   throw new Error("Failed to fetch token price")
      // }

      // const data = await response.json()
      // return data[tokenAddress.toLowerCase()]
    },
    // Refetch every 60 seconds
    refetchInterval: 60000,
    // Keep stale data for 5 minutes
    staleTime: 300000,
    // Retry 3 times with exponential backoff
    retry: 3,
  })
}

export function PricesBar() {
  const { currentMarket } = useMarket()
  const { defaultChain } = useDefaultChain()
  const base = currentMarket?.base
  const quote = currentMarket?.quote
  const tickSpacing = currentMarket?.tickSpacing
  // const { data, isLoading: mangroveTokenPriceLoading } =
  //   useMangroveTokenPricesQuery(
  //     base?.address,
  //     quote?.address,
  //     Number(tickSpacing),
  //   )

  const { data: basePrice, isLoading: basePriceLoading } = useTokenPrice(
    base?.address ?? "",
    defaultChain.id,
  )
  const { data: quotePrice, isLoading: quotePriceLoading } = useTokenPrice(
    quote?.address ?? "",
    defaultChain.id,
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
    spotPrice = spotPrice ? 1 / spotPrice : undefined
  }

  // Calculate variation only if we have valid data
  const hasValidPriceData =
    basePrice &&
    quotePrice &&
    !isNaN(Number(basePrice)) &&
    !isNaN(Number(quotePrice)) &&
    Number(basePrice) > 0

  const variation24hPercentage = hasValidPriceData
    ? ((Number(quotePrice) - Number(basePrice)) / Number(quotePrice)) * 100
    : undefined

  const variation24hClassnames = cn({
    "text-green-caribbean":
      variation24hPercentage !== undefined && variation24hPercentage >= 0,
    "text-red-100":
      variation24hPercentage !== undefined && variation24hPercentage < 0,
  })

  // Format percentage for display
  const formattedPercentage =
    variation24hPercentage !== undefined && !isNaN(variation24hPercentage)
      ? new Intl.NumberFormat(undefined, {
          style: "percent",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(Math.abs(variation24hPercentage) / 100)
      : "-"

  return (
    <>
      <div className="flex items-center pl-2 pr-2">
        <Item
          label={"Price"}
          value={spotPrice}
          token={side === "quote" ? base : quote}
          skeleton={false}
        />
      </div>
      <ScrollArea className="relative w-full ">
        <motion.div
          className="flex items-center w-full space-x-5 whitespace-nowrap h-full min-h-[48px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Item
            label={`24h Change`}
            value={variation24hPercentage}
            token={token}
            skeleton={basePriceLoading || quotePriceLoading}
            className={variation24hClassnames}
            rightElement={
              variation24hPercentage !== undefined &&
              !isNaN(variation24hPercentage) ? (
                <motion.span
                  className={cn(
                    "space-x-[2px] text-xs inline-flex ml-2",
                    variation24hClassnames,
                  )}
                  animate={{
                    scale: [1, 1.05, 1],
                    transition: {
                      duration: 0.5,
                      repeat: 0,
                      repeatType: "reverse",
                    },
                  }}
                >
                  <VariationArrow
                    className={cn("h-3", {
                      "rotate-180": variation24hPercentage < 0,
                    })}
                  />
                  <span>{formattedPercentage}</span>
                </motion.span>
              ) : undefined
            }
          />

          <Item
            label="24h High"
            value={
              quotePrice && !isNaN(Number(quotePrice))
                ? Number(quotePrice)
                : undefined
            }
            token={token}
            skeleton={quotePriceLoading}
          />

          <Item
            label="24h Low"
            value={
              basePrice && !isNaN(Number(basePrice))
                ? Number(basePrice)
                : undefined
            }
            token={token}
            skeleton={basePriceLoading}
          />

          <Item
            label="24h Volume"
            value={
              quotePrice && !isNaN(Number(quotePrice))
                ? Number(quotePrice)
                : undefined
            }
            token={token}
            skeleton={quotePriceLoading}
          />
        </motion.div>
        <ScrollBar
          orientation="horizontal"
          className="shadow-sm bg-transparent"
        />
      </ScrollArea>
    </>
  )
}
