"use client"

import type { Token } from "@mangrovedao/mgv"
import { AnimatePresence, motion } from "framer-motion"
import React from "react"

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { useMergedBooks } from "@/hooks/new_ghostbook/book"
import useMangrovePoolStatsQuery from "@/hooks/use-pool-stats"
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

export function PricesBar() {
  const { currentMarket } = useMarket()
  const {
    mergedBooks: book,
    refetch: refetchBooks,
    spotPrice,
  } = useMergedBooks()
  const base = currentMarket?.base
  const quote = currentMarket?.quote
  const { data: stats, isLoading: statsLoading } = useMangrovePoolStatsQuery(
    base?.address,
    quote?.address,
  )

  React.useEffect(() => {
    const interval = setInterval(() => {
      refetchBooks()
    }, 5000)

    return () => clearInterval(interval)
  }, [refetchBooks])

  const [side, setSide] = React.useState<"base" | "quote">("base")

  const token = side === "base" ? quote : base

  // Calculate spread and midpoint

  // if (side === "quote") {
  //   spotPrice = spotPrice ? 1 / spotPrice : undefined
  // }

  // Calculate variation only if we have valid data
  const hasValidPriceData =
    stats?.close &&
    stats?.open &&
    !isNaN(Number(stats.close)) &&
    !isNaN(Number(stats.open)) &&
    Number(stats.close) > 0

  const variation24hPercentage = hasValidPriceData
    ? ((Number(stats.close) - Number(stats.open)) / Number(stats.close)) * 100
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
          value={side === "quote" ? 1 / (spotPrice ?? 1) : spotPrice}
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
            skeleton={statsLoading}
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
              stats?.high && !isNaN(Number(stats.high))
                ? Number(stats.high)
                : undefined
            }
            token={token}
            skeleton={statsLoading}
          />

          <Item
            label="24h Low"
            value={
              stats?.low && !isNaN(Number(stats.low))
                ? Number(stats.low)
                : undefined
            }
            token={token}
            skeleton={statsLoading}
          />

          <Item
            label="24h Volume"
            value={
              stats?.volume && !isNaN(Number(stats.volume))
                ? Number(stats.volume)
                : undefined
            }
            token={token}
            skeleton={statsLoading}
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
