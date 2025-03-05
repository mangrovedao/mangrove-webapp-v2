"use client"

import { CompleteOffer } from "@mangrovedao/mgv"
import { BA } from "@mangrovedao/mgv/lib"
import React, { useMemo, useRef } from "react"

import { TableRow } from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import useMarket from "@/providers/market"
import { cn } from "@/utils"
import { OrderBookTableCell } from "./table-cell"
import { calculateCumulatedVolume } from "./utils"

type SemiBookProps = {
  type: BA
  data?: {
    asks: CompleteOffer[]
    bids: CompleteOffer[]
  } | null
  priceDecimals: number
}

// Create a memoized offer component to prevent unnecessary re-renders
const MemoizedOffer = React.memo(
  ({
    offer,
    type,
    index,
    isRefRow,
    priceDecimals,
    maxVolume,
    currentMarket,
    hoveredOfferId,
    setHoveredOfferId,
  }: {
    offer: CompleteOffer & { cumulatedVolume?: number }
    type: BA
    index: number
    isRefRow: boolean
    priceDecimals: number
    maxVolume: number
    currentMarket: any
    hoveredOfferId: string | null
    setHoveredOfferId: (id: string | null) => void
  }) => {
    const { price, id, volume, cumulatedVolume } = offer
    const offerId = id.toString()
    const rowRef = useRef<HTMLTableRowElement>(null)

    const cumulatedVolumePercentage =
      ((cumulatedVolume ?? 0) * 100) / (maxVolume ?? 1)

    const isHovered = hoveredOfferId === offerId

    return (
      <TooltipProvider key={`${type}-${offerId}-tooltip`}>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <TableRow
              ref={isRefRow ? rowRef : null}
              key={`${type}-${offerId}`}
              className={cn(
                "relative h-2 border-none transition-all duration-300 group cursor-pointer",
                "hover:bg-background-secondary/70 hover:backdrop-blur-sm",
                "animate-fadeIn",
                isHovered &&
                  type === "asks" &&
                  "bg-red-100/10 shadow-[inset_0_0_0_1px_rgba(255,0,0,0.2)]",
                isHovered &&
                  type === "bids" &&
                  "bg-green-caribbean/10 shadow-[inset_0_0_0_1px_rgba(0,128,0,0.2)]",
              )}
              onClick={() => {
                dispatchEvent(
                  new CustomEvent("on-orderbook-offer-clicked", {
                    detail: { price: price.toString() },
                  }),
                )
              }}
              onMouseEnter={() => setHoveredOfferId(offerId)}
              onMouseLeave={() => setHoveredOfferId(null)}
            >
              <OrderBookTableCell
                className={cn(
                  type === "asks" ? "text-red-100" : "text-green-caribbean",
                  "transition-colors duration-200",
                  isHovered && "font-medium",
                )}
              >
                <Cell
                  value={price}
                  pDecimals={priceDecimals}
                  priceDecimals={priceDecimals}
                />
              </OrderBookTableCell>
              <OrderBookTableCell
                className={cn(
                  "text-right transition-colors duration-200",
                  isHovered && "font-medium",
                )}
              >
                <Cell
                  value={volume}
                  priceDecimals={currentMarket?.base.decimals}
                  pDecimals={priceDecimals}
                />
              </OrderBookTableCell>
              <OrderBookTableCell
                className={cn(
                  "text-right text-muted-foreground transition-colors duration-200",
                  isHovered && "font-medium text-foreground",
                )}
              >
                <Cell
                  value={price * volume}
                  pDecimals={priceDecimals}
                  priceDecimals={priceDecimals}
                />
              </OrderBookTableCell>
              <td
                className={cn(
                  "absolute inset-y-0 -z-10 transition-all duration-500 ease-out",
                  "left-0",
                )}
              ></td>
              <style jsx>{`
                td:last-of-type {
                  width: ${cumulatedVolumePercentage}%;
                  background: ${type === "bids"
                    ? "linear-gradient(90deg, rgba(0, 128, 0, 0.05) 0%, rgba(0, 128, 0, 0.25) 100%)"
                    : "linear-gradient(90deg, rgba(255, 0, 0, 0.05) 0%, rgba(255, 0, 0, 0.25) 100%)"};
                  transition:
                    width 0.8s cubic-bezier(0.16, 1, 0.3, 1),
                    background-color 0.4s ease,
                    opacity 0.3s ease;
                  box-shadow: ${type === "bids"
                    ? "inset 0 0 8px rgba(0, 128, 0, 0.1)"
                    : "inset 0 0 8px rgba(255, 0, 0, 0.1)"};
                  opacity: 0.9;
                  border-radius: 0 4px 4px 0;
                  animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                  animation-delay: ${index * 0.1}s;
                }
                tr:hover td:last-of-type {
                  background: ${type === "bids"
                    ? "linear-gradient(90deg, rgba(0, 128, 0, 0.1) 0%, rgba(0, 128, 0, 0.35) 100%)"
                    : "linear-gradient(90deg, rgba(255, 0, 0, 0.1) 0%, rgba(255, 0, 0, 0.35) 100%)"};
                  opacity: 1;
                  box-shadow: ${type === "bids"
                    ? "inset 0 0 12px rgba(0, 128, 0, 0.2)"
                    : "inset 0 0 12px rgba(255, 0, 0, 0.2)"};
                  animation: none;
                }
              `}</style>
            </TableRow>
          </TooltipTrigger>
          <TooltipContent
            side="right"
            className="bg-bg-secondary/95 border border-border-tertiary backdrop-blur-md p-3 rounded-lg shadow-lg"
          >
            <div className="space-y-2">
              <div className="flex justify-between items-center border-b border-border-tertiary pb-1">
                <span
                  className={cn(
                    "font-medium",
                    type === "asks" ? "text-red-100" : "text-green-caribbean",
                  )}
                >
                  {type === "asks" ? "Ask Offer" : "Bid Offer"}
                </span>
                <span className="text-xs text-muted-foreground">
                  ID: {offerId.substring(0, 8)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <span className="text-muted-foreground">Price:</span>
                <span className="font-mono font-medium text-right">
                  {price.toLocaleString(undefined, {
                    minimumFractionDigits: priceDecimals,
                    maximumFractionDigits: priceDecimals,
                  })}{" "}
                  {currentMarket?.quote.symbol}
                </span>

                <span className="text-muted-foreground">Size:</span>
                <span className="font-mono font-medium text-right">
                  {volume.toLocaleString(undefined, {
                    minimumFractionDigits: priceDecimals,
                    maximumFractionDigits: priceDecimals,
                  })}{" "}
                  {currentMarket?.base.symbol}
                </span>

                <span className="text-muted-foreground">Total:</span>
                <span className="font-mono font-medium text-right">
                  {(price * volume).toLocaleString(undefined, {
                    minimumFractionDigits: priceDecimals,
                    maximumFractionDigits: priceDecimals,
                  })}{" "}
                  {currentMarket?.quote.symbol}
                </span>

                <span className="text-muted-foreground">Cumulative Vol:</span>
                <span className="font-mono font-medium text-right">
                  {cumulatedVolume?.toLocaleString(undefined, {
                    minimumFractionDigits: priceDecimals,
                    maximumFractionDigits: priceDecimals,
                  })}{" "}
                  {currentMarket?.base.symbol}
                </span>
              </div>

              <div className="text-xs text-center text-muted-foreground pt-1 border-t border-border-tertiary">
                Click to use this price in order form
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  },
  // Custom comparison function to prevent unnecessary re-renders
  (prevProps, nextProps) => {
    // Only re-render if these specific props change
    return (
      prevProps.offer.price === nextProps.offer.price &&
      prevProps.offer.volume === nextProps.offer.volume &&
      prevProps.offer.cumulatedVolume === nextProps.offer.cumulatedVolume &&
      prevProps.hoveredOfferId === nextProps.hoveredOfferId &&
      prevProps.priceDecimals === nextProps.priceDecimals
    )
  },
)

MemoizedOffer.displayName = "MemoizedOffer"

export const SemiBook = React.forwardRef<
  React.ElementRef<typeof TableRow>,
  SemiBookProps
>(({ type, data, priceDecimals }, ref) => {
  const { currentMarket } = useMarket()
  const { dataWithCumulatedVolume, maxVolume } = calculateCumulatedVolume(data)
  const [hoveredOfferId, setHoveredOfferId] = React.useState<string | null>(
    null,
  )

  // Memoize the offers to prevent unnecessary re-renders
  const memoizedOffers = useMemo(() => {
    // Get the offers for the current type (bids or asks)
    const offersData = dataWithCumulatedVolume?.[type] || []

    // Create a new array and sort it
    return [...offersData].sort((a, b) =>
      type === "asks" ? a.price - b.price : b.price - a.price,
    )
  }, [dataWithCumulatedVolume, type])

  const refIndex =
    type === "bids" ? 0 : memoizedOffers.length ? memoizedOffers.length - 1 : 0

  return memoizedOffers.map((offer, i) => (
    <MemoizedOffer
      key={`${type}-${offer.id.toString()}`}
      offer={offer}
      type={type}
      index={i}
      isRefRow={refIndex === i}
      priceDecimals={priceDecimals}
      maxVolume={maxVolume ?? 1}
      currentMarket={currentMarket}
      hoveredOfferId={hoveredOfferId}
      setHoveredOfferId={setHoveredOfferId}
    />
  ))
})

SemiBook.displayName = "SemiBook"

function Cell({
  value,
  priceDecimals,
  pDecimals,
}: {
  value: number
  priceDecimals?: number
  pDecimals: number
}) {
  const [prevValue, setPrevValue] = React.useState(value)
  const [isAnimating, setIsAnimating] = React.useState(false)

  React.useEffect(() => {
    if (prevValue !== value) {
      setIsAnimating(true)
      setPrevValue(value)

      const timer = setTimeout(() => {
        setIsAnimating(false)
      }, 500) // Match the animation duration

      return () => clearTimeout(timer)
    }
  }, [value, prevValue])

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger className="w-full">
          <span
            className={cn(
              "font-mono text-xs font-light transition-all duration-200 hover:font-medium group-hover:scale-105",
              isAnimating && "animate-valueChange",
            )}
          >
            {value.toLocaleString(undefined, {
              minimumFractionDigits: pDecimals,
              maximumFractionDigits: pDecimals,
            })}
          </span>
        </TooltipTrigger>
      </Tooltip>
    </TooltipProvider>
  )
}
