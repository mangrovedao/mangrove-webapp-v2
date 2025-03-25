"use client"

import { BA } from "@mangrovedao/mgv/lib"
import React, { useMemo, useRef } from "react"

import { TableRow } from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { EnhancedOffer, OfferStatus } from "@/hooks/use-uniswap-book"
import useMarket from "@/providers/market"
import { cn } from "@/utils"
import { OrderBookTableCell } from "./table-cell"
import { calculateCumulatedVolume } from "./utils"

type SemiBookProps = {
  type: BA
  data?: {
    asks: EnhancedOffer[]
    bids: EnhancedOffer[]
  } | null
  priceDecimals: number
}

// Create a more optimized memoized offer component with a custom equality check
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
    offer: EnhancedOffer
    type: BA
    index: number
    isRefRow: boolean
    priceDecimals: number
    maxVolume: number
    currentMarket: any
    hoveredOfferId: string | null
    setHoveredOfferId: (id: string | null) => void
  }) => {
    const { price, id, volume, cumulatedVolume, status } = offer
    const offerId = id.toString()
    const rowRef = useRef<HTMLTableRowElement>(null)

    const cumulatedVolumePercentage =
      ((cumulatedVolume ?? 0) * 100) / (maxVolume ?? 1)

    const isHovered = hoveredOfferId === offerId

    // Apply different animation classes based on the offer's status
    const getAnimationClass = () => {
      switch (status) {
        case "new":
          return "animate-fadeIn"
        case "changed":
          return "safari-pulse-fix" // Use a custom class that works in Safari
        case "removing":
          return "animate-fadeOut"
        default:
          return ""
      }
    }

    return (
      <TooltipProvider key={`${type}-${offerId}-tooltip`}>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <TableRow
              ref={isRefRow ? rowRef : null}
              key={`${type}-${offerId}`}
              className={cn(
                "relative h-1 border-none transition-all duration-300 group cursor-pointer",
                "hover:bg-background-secondary/70 hover:backdrop-blur-sm",
                getAnimationClass(),
                isHovered &&
                  type === "asks" &&
                  "bg-red-100/10 shadow-[inset_0_0_0_1px_rgba(255,0,0,0.2)]",
                isHovered &&
                  type === "bids" &&
                  "bg-green-caribbean/10 shadow-[inset_0_0_0_1px_rgba(0,128,0,0.2)]",
                status === "removing" && "opacity-0 pointer-events-none",
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
              style={
                {
                  // Remove animation style and use className instead
                }
              }
            >
              <OrderBookTableCell
                className={cn(
                  type === "asks" ? "text-red-100" : "text-green-caribbean",
                  "transition-colors duration-200",
                  (status === "new" || status === "changed") && "font-medium",
                  isHovered && "font-medium",
                )}
              >
                <Cell
                  value={price}
                  pDecimals={priceDecimals}
                  priceDecimals={priceDecimals}
                  status={status}
                />
              </OrderBookTableCell>
              <OrderBookTableCell
                className={cn(
                  "text-right transition-colors duration-200",
                  (status === "new" || status === "changed") && "font-medium",
                  isHovered && "font-medium",
                )}
              >
                <Cell
                  value={volume}
                  priceDecimals={currentMarket?.base.decimals}
                  pDecimals={priceDecimals}
                  status={status}
                />
              </OrderBookTableCell>
              <OrderBookTableCell
                className={cn(
                  "text-right text-muted-foreground transition-colors duration-200",
                  (status === "new" || status === "changed") &&
                    "font-medium text-foreground",
                  isHovered && "font-medium text-foreground",
                )}
              >
                <Cell
                  value={price * volume}
                  pDecimals={priceDecimals}
                  priceDecimals={priceDecimals}
                  status={status}
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
                    ? "linear-gradient(to right, rgba(0, 128, 0, 0.05) 0%, rgba(0, 128, 0, 0.25) 100%)"
                    : "linear-gradient(to right, rgba(255, 0, 0, 0.05) 0%, rgba(255, 0, 0, 0.25) 100%)"};
                  -webkit-transition:
                    width 0.8s cubic-bezier(0.16, 1, 0.3, 1),
                    background-color 0.4s ease,
                    opacity 0.3s ease;
                  transition:
                    width 0.8s cubic-bezier(0.16, 1, 0.3, 1),
                    background-color 0.4s ease,
                    opacity 0.3s ease;
                  -webkit-box-shadow: ${type === "bids"
                    ? "inset 0 0 8px rgba(0, 128, 0, 0.1)"
                    : "inset 0 0 8px rgba(255, 0, 0, 0.1)"};
                  box-shadow: ${type === "bids"
                    ? "inset 0 0 8px rgba(0, 128, 0, 0.1)"
                    : "inset 0 0 8px rgba(255, 0, 0, 0.1)"};
                  opacity: 0.9;
                  border-radius: 0 4px 4px 0;
                  -webkit-animation: simplePulse 4s ease infinite;
                  animation: simplePulse 4s ease infinite;
                  -webkit-animation-delay: ${index * 0.1}s;
                  animation-delay: ${index * 0.1}s;
                }
                tr:hover td:last-of-type {
                  background: ${type === "bids"
                    ? "linear-gradient(to right, rgba(0, 128, 0, 0.1) 0%, rgba(0, 128, 0, 0.35) 100%)"
                    : "linear-gradient(to right, rgba(255, 0, 0, 0.1) 0%, rgba(255, 0, 0, 0.35) 100%)"};
                  opacity: 1;
                  -webkit-box-shadow: ${type === "bids"
                    ? "inset 0 0 12px rgba(0, 128, 0, 0.2)"
                    : "inset 0 0 12px rgba(255, 0, 0, 0.2)"};
                  box-shadow: ${type === "bids"
                    ? "inset 0 0 12px rgba(0, 128, 0, 0.2)"
                    : "inset 0 0 12px rgba(255, 0, 0, 0.2)"};
                  -webkit-animation: none;
                  animation: none;
                }
                @-webkit-keyframes simplePulse {
                  0%,
                  100% {
                    opacity: 0.9;
                  }
                  50% {
                    opacity: 0.7;
                  }
                }
                @keyframes simplePulse {
                  0%,
                  100% {
                    opacity: 0.9;
                  }
                  50% {
                    opacity: 0.7;
                  }
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
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <span className="text-muted-foreground">Price:</span>
                <span className="font-sansfont-medium text-right">
                  {price.toLocaleString(undefined, {
                    minimumFractionDigits: priceDecimals,
                    maximumFractionDigits: priceDecimals,
                  })}{" "}
                  {currentMarket?.quote.symbol}
                </span>

                <span className="text-muted-foreground">Size:</span>
                <span className="font-sansfont-medium text-right">
                  {volume.toLocaleString(undefined, {
                    minimumFractionDigits: priceDecimals,
                    maximumFractionDigits: priceDecimals,
                  })}{" "}
                  {currentMarket?.base.symbol}
                </span>

                <span className="text-muted-foreground">Total:</span>
                <span className="font-sansfont-medium text-right">
                  {(price * volume).toLocaleString(undefined, {
                    minimumFractionDigits: priceDecimals,
                    maximumFractionDigits: priceDecimals,
                  })}{" "}
                  {currentMarket?.quote.symbol}
                </span>

                <span className="text-muted-foreground">Cumulative Vol:</span>
                <span className="font-sansfont-medium text-right">
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
  // Custom equality function to only re-render when relevant props change
  (prevProps, nextProps) => {
    // Always re-render if the offer status changed
    if (prevProps.offer.status !== nextProps.offer.status) {
      return false
    }

    // Re-render if hover state changes for this offer
    if (
      (prevProps.hoveredOfferId === prevProps.offer.id.toString()) !==
      (nextProps.hoveredOfferId === nextProps.offer.id.toString())
    ) {
      return false
    }

    // Re-render if the offer's core data changes
    if (
      prevProps.offer.price !== nextProps.offer.price ||
      prevProps.offer.volume !== nextProps.offer.volume ||
      prevProps.offer.id.toString() !== nextProps.offer.id.toString() ||
      prevProps.priceDecimals !== nextProps.priceDecimals
    ) {
      return false
    }

    // Otherwise, don't re-render
    return true
  },
)

MemoizedOffer.displayName = "MemoizedOffer"

export const SemiBook = React.memo(
  React.forwardRef<React.ElementRef<typeof TableRow>, SemiBookProps>(
    ({ type, data, priceDecimals }, ref) => {
      const { currentMarket } = useMarket()
      const { dataWithCumulatedVolume, maxVolume } =
        calculateCumulatedVolume(data)
      const [hoveredOfferId, setHoveredOfferId] = React.useState<string | null>(
        null,
      )

      // Use a ref to store previous offers with correct typing
      const prevOffersRef = useRef<Map<string, EnhancedOffer> | null>(null)

      // Create a stable collection of offers with memoization for identity stability
      const memoizedOffers = useMemo(() => {
        // Get the offers for the current type (bids or asks)
        const offersData = dataWithCumulatedVolume?.[type] || []

        // Sort the offers - need to create a new array for proper sorting
        const sortedOffers = [...offersData].sort((a, b) =>
          type === "asks" ? a.price - b.price : b.price - a.price,
        ) as EnhancedOffer[]

        // If we don't have previous offers yet, initialize the map and return sorted offers
        if (!prevOffersRef.current) {
          const offersMap = new Map<string, EnhancedOffer>()
          sortedOffers.forEach((offer) => {
            offersMap.set(offer.id.toString(), offer)
          })
          prevOffersRef.current = offersMap
          return sortedOffers
        }

        // If we have previous offers, check if we can reuse any to maintain reference stability
        const updatedMap = new Map<string, EnhancedOffer>()
        const stableOffers = sortedOffers.map((newOffer) => {
          const offerId = newOffer.id.toString()
          const prevOffer = prevOffersRef.current?.get(offerId)

          // If the offer exists and hasn't changed, reuse the previous reference
          if (
            prevOffer &&
            prevOffer.price === newOffer.price &&
            prevOffer.volume === newOffer.volume
          ) {
            updatedMap.set(offerId, prevOffer)
            return prevOffer
          }

          // Otherwise, use the new offer
          updatedMap.set(offerId, newOffer)
          return newOffer
        })

        // Update our reference for next render
        prevOffersRef.current = updatedMap

        return stableOffers
      }, [dataWithCumulatedVolume, type])

      const refIndex =
        type === "bids"
          ? 0
          : memoizedOffers.length
            ? memoizedOffers.length - 1
            : 0

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
    },
  ),
  // Custom equality function
  (prevProps, nextProps) => {
    // Only re-render if the data or price decimals have changed
    if (prevProps.priceDecimals !== nextProps.priceDecimals) {
      return false
    }

    // If data is null or undefined for either, re-render if they're different
    if (!prevProps.data || !nextProps.data) {
      return prevProps.data === nextProps.data
    }

    // Check if the relevant data for this type has changed
    const prevOffers = prevProps.data[prevProps.type]
    const nextOffers = nextProps.data[nextProps.type]

    // Quick length check
    if (!prevOffers || !nextOffers || prevOffers.length !== nextOffers.length) {
      return false
    }

    // Check each offer for changes
    for (let i = 0; i < nextOffers.length; i++) {
      if (
        prevOffers[i]?.price !== nextOffers[i]?.price ||
        prevOffers[i]?.volume !== nextOffers[i]?.volume ||
        prevOffers[i]?.id.toString() !== nextOffers[i]?.id.toString()
      ) {
        return false
      }
    }

    // No changes detected
    return true
  },
)

SemiBook.displayName = "SemiBook"

function Cell({
  value,
  priceDecimals,
  pDecimals,
  status,
}: {
  value: number
  priceDecimals?: number
  pDecimals: number
  status?: OfferStatus
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
              "font-sans text-xs font-light transition-all duration-200 hover:font-medium group-hover:scale-105",
              isAnimating && "animate-valueChange",
              status === "new" && "animate-fadeIn font-medium",
              status === "changed" && "animate-pulse-once font-medium",
              status === "removing" && "animate-fadeOut",
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
