import { type Market } from "@mangrovedao/mangrove.js"
import { type OfferDistribution } from "@mangrovedao/mangrove.js/dist/nodejs/kandel/kandelDistribution"
import { AxisBottom, AxisRight } from "@visx/axis"
import { Brush } from "@visx/brush"
import { type Bounds } from "@visx/brush/lib/types"
import { curveStep } from "@visx/curve"
import { localPoint } from "@visx/event"
import { Group } from "@visx/group"
import { scaleLinear } from "@visx/scale"
import { AreaClosed, Circle, Line } from "@visx/shape"
import { TooltipWithBounds, withTooltip } from "@visx/tooltip"
import { Zoom } from "@visx/zoom"
import { type ProvidedZoom } from "@visx/zoom/lib/types"
import Big from "big.js"
import clsx from "clsx"
import { bisector } from "d3-array"
import React from "react"
import useMeasure, { type RectReadOnly } from "react-use-measure"
import { useDebounce } from "usehooks-ts"

import { Spinner } from "@/components/ui/spinner"
import { useKeyPress } from "@/hooks/use-key-press"
import { X } from "lucide-react"
import BrushHandle from "./BrushHandle"
import ZoomPanel from "./ZoomPanel"
import { type MergedOffers } from "./types"

type Offer = Pick<Market.Offer, "id" | "volume" | "price">

type TooltipData = Offer

const BRUSH_COLOR_CLASS = {
  red: "main-brush-red",
  green: "main-brush-green",
  transparent: "main-brush-transparent",
}

const areClose = (
  brushMinPrice: number,
  brushMaxPrice: number,
  tolerance = 1,
): boolean => {
  return Math.abs(brushMinPrice - brushMaxPrice) <= tolerance
}

const defaultWidth = 100
const defaultHeight = 100

// accessors
const getXValue = (d: Offer) => (d && d.price ? Big(d.price).toNumber() : 0)
const getYValue = (d: Offer) => (d && d.volume ? Big(d.volume).toNumber() : 0)

const getFixedString = (p: string, decimals = 2) =>
  Big(p || 0).toFixed(decimals)

const headerHeight = 71

type ChartProps = {
  margin?: { top: number; right: number; bottom: number; left: number }
  bounds: RectReadOnly
  zoom: ProvidedZoom<Element> & { isDragging: boolean }
  readonly?: boolean
  orderBookData: {
    offers: {
      id: number
      price: Big | undefined
      volume: Big
    }[]
    midPrice: {
      id: number
      volume: Big
      price: Big | undefined
    }
  }
  selection: number[]
  onDomainChange?: (domain: number[]) => void
  onSelectionChange?: (domain: number[]) => void
  onSelectionEnd?: (domain: number[]) => void
  baseSymbol: string
  quoteSymbol: string
  priceDecimals: number
  baseDecimals: number
  title?: string
  showMinMaxTooltips?: boolean
  enableWheelZoom?: boolean
  offers?: MergedOffers
  simulatedOffers?: OfferDistribution
  overedOffer?: MergedOffers[number]
  setOveredOffer?: (offer: MergedOffers[number] | undefined) => void
  topRightElements?: JSX.Element
  refill?: (setLoading: (state: boolean) => void, id: number) => void
}

const Chart = withTooltip<ChartProps, TooltipData>(
  ({
    margin = { top: 0, right: 0, bottom: 32, left: 0 },
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipLeft = 0,
    tooltipTop = 0,
    zoom,
    bounds,
    readonly = false,
    orderBookData,
    selection,
    onDomainChange,
    onSelectionChange,
    onSelectionEnd,
    baseSymbol,
    quoteSymbol,
    priceDecimals,
    baseDecimals,
    title = "Price range",
    showMinMaxTooltips = true,
    enableWheelZoom = false,
    offers,
    simulatedOffers,
    overedOffer,
    setOveredOffer,
    topRightElements,
    refill,
  }) => {
    const midPrice = React.useMemo(
      () => orderBookData.midPrice,
      [orderBookData.midPrice],
    )

    const midPriceAsBig = midPrice.price
    const data = React.useMemo(
      () => orderBookData.offers || [],
      [orderBookData.offers],
    )

    const altPress: boolean = useKeyPress("Alt")
    const svgRef = React.useRef<any>(undefined)
    const leftRef = React.useRef<any>(undefined)
    const rightRef = React.useRef<any>(undefined)
    const width = bounds.width || defaultWidth
    const height = bounds.height || defaultHeight

    // bounds
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    const yScale = React.useMemo(
      () =>
        scaleLinear({
          range: [innerHeight + margin.top, margin.top],
          domain: [
            Math.min(...data.map(getYValue)) * 0.7,
            Math.max(...data.map(getYValue)) * 1.3,
          ],
          nice: true,
        }),
      [data, innerHeight, margin.top],
    )

    const minD = Big(
      (offers && offers?.length > 1 ? offers[0].price : midPrice?.price) || 0,
    )
    const maxD = Big(
      (offers && offers?.length > 1
        ? offers[offers.length - 1].price
        : midPrice?.price) || 0,
    )

    const xScale = React.useMemo(
      () =>
        scaleLinear({
          range: [margin.left, innerWidth + margin.left],
          domain: [minD.mul(0.7).toNumber(), maxD.mul(1.3).toNumber()],
        }),
      [innerWidth, margin.left, maxD, minD],
    )
    const rescaleXAxis = (zoom: ProvidedZoom<Element>) => {
      const newXDomain = xScale.range().map((r) => {
        return xScale.invert(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          (r - zoom.transformMatrix.translateX) / zoom.transformMatrix.scaleX,
        )
      })
      return xScale.copy().domain(newXDomain)
    }
    const zoomScale = rescaleXAxis(zoom)

    const [reFillLoading, setReFillLoading] = React.useState(false)
    const [brushData, setBrushData] = React.useState({
      brushMinPrice: selection?.[0] ?? 0,
      brushMaxPrice: selection?.[1] ?? 0,
    })
    const [brushIsChanging, setBrushIsChanging] = React.useState(false)

    const xPositionMidPrice = zoomScale(getXValue(midPrice)) ?? 0
    const [timestamp, setTimestamp] = React.useState(Date.now())

    const [wheelDelta, setWheelDelta] = React.useState<WheelEvent | undefined>(
      undefined,
    )

    const debouncedWheelDelta = useDebounce(wheelDelta, 10)

    // Brush
    const initialBrushPosition = React.useMemo(
      () => ({
        start: {
          x: zoomScale(brushData.brushMinPrice),
        },
        end: {
          x: zoomScale(brushData.brushMaxPrice),
        },
      }),
      [brushData.brushMaxPrice, brushData.brushMinPrice, zoomScale],
    )

    React.useEffect(() => {
      setBrushData({
        brushMinPrice: selection?.[0] ?? 0,
        brushMaxPrice: selection?.[1] ?? 0,
      })
      updateBrushPosition()
    }, [selection])

    // retreive all the prices within the brush range
    const onBrushChange = (domain: Bounds | null) => {
      if (readonly) return
      if (!domain) {
        setBrushData({
          brushMinPrice: 0,
          brushMaxPrice: 0,
        })
        return
      }
      const { x0, x1 } = domain
      onSelectionChange?.([x0, x1])
      setBrushData({
        brushMinPrice: x0,
        brushMaxPrice: x1,
      })
    }

    const brushColorClass = React.useMemo(() => {
      const price = (midPrice?.price ?? Big(0)).toNumber()
      const { brushMinPrice, brushMaxPrice } = brushData

      if (brushMinPrice < price && brushMaxPrice < price) {
        return BRUSH_COLOR_CLASS.green
      } else if (brushMinPrice > price && brushMaxPrice > price) {
        return BRUSH_COLOR_CLASS.red
      } else {
        return BRUSH_COLOR_CLASS.transparent
      }
    }, [brushData, midPrice.price])

    const showCustomBrushZone = React.useMemo(() => {
      const price = (midPrice.price ?? Big(0)).toNumber()
      const { brushMinPrice, brushMaxPrice } = brushData
      if (
        brushMinPrice > price ||
        brushMaxPrice < price ||
        (brushMinPrice === 0 && brushMaxPrice === 0)
      ) {
        return false
      }

      return true
    }, [brushData, midPrice.price])

    const minBrushOverlayWidth = Math.abs(
      xPositionMidPrice - zoomScale(brushData.brushMinPrice),
    )
    const maxBrushOverlayWidth = Math.abs(
      zoomScale(brushData.brushMaxPrice) - xPositionMidPrice,
    )

    function showCurrentPointTooltip(
      event: React.TouchEvent<SVGElement> | React.MouseEvent<SVGElement>,
    ) {
      if (altPress || brushIsChanging) return
      const { x } = localPoint(event) ?? { x: 0 }
      const x0 = zoomScale.invert(x)
      const bisectPrice = bisector<Offer, number>(getXValue).left

      const index = bisectPrice(data, x0)
      const d0 = data[index - 1]
      const d1 = data[index]
      // if we are out of range, hide the tooltip
      if (d0 === undefined || d1 === undefined || zoom.isDragging)
        return hideTooltip()
      let d = d0

      if (d1 && getXValue(d1)) {
        d =
          x0.valueOf() - getXValue(d0).valueOf() >
          getXValue(d1).valueOf() - x0.valueOf()
            ? d1
            : d0
      }
      showTooltip({
        tooltipData: d,
        tooltipLeft: x,
        tooltipTop: yScale(getYValue(d)),
      })
    }

    const handleSelectionEnd = React.useCallback(
      function () {
        onSelectionEnd?.([brushData.brushMinPrice, brushData.brushMaxPrice])
        setBrushIsChanging(false)
      },
      [brushData.brushMaxPrice, brushData.brushMinPrice, onSelectionEnd],
    )

    const handleDomainChange = React.useCallback(
      function () {
        onDomainChange?.(zoomScale.domain())
      },
      [onDomainChange, zoomScale],
    )

    function reset() {
      zoom.reset()
      handleDomainChange()
    }

    const zoomIn = React.useCallback(
      function () {
        zoom.scale({ scaleX: 1.1 })
        handleDomainChange()
      },
      [handleDomainChange, zoom],
    )

    const zoomOut = React.useCallback(
      function () {
        zoom.scale({ scaleX: 0.9 })
        handleDomainChange()
      },
      [handleDomainChange, zoom],
    )

    function dragMove(e: any) {
      zoom.dragMove(e)
    }

    function dragStart(e: any) {
      zoom.dragStart(e)
      hideTooltip()
    }

    function dragEnd() {
      zoom.dragEnd()
      handleDomainChange()
    }

    const updateBrushPosition = () => {
      setTimestamp(Date.now())
    }

    const handleWheel = (event: any) => {
      if (!enableWheelZoom) return
      setWheelDelta(event)
    }

    React.useEffect(() => {
      if (debouncedWheelDelta && wheelDelta) {
        if (wheelDelta?.deltaY > 0) {
          zoomOut()
        } else if (wheelDelta?.deltaY < 0) {
          zoomIn()
        }
        setWheelDelta(undefined)
      }
    }, [debouncedWheelDelta, wheelDelta, zoomIn, zoomOut])

    React.useEffect(() => {
      updateBrushPosition()
      hideTooltip()
    }, [hideTooltip, zoom])

    React.useEffect(() => {
      if (altPress) {
        hideTooltip()
      }
    }, [altPress, hideTooltip])

    return (
      <div className="overflow-hidden relative">
        <div className="flex justify-between items-center border-b border-[#1B1F2F] p-4 min-h-[71px]">
          <ZoomPanel
            {...{
              zoomIn,
              zoomOut,
              reset,
              showReset: "matrix(1, 0, 0, 1, 0, 0)" !== zoom.toString(),
              topRightElements,
            }}
          />
        </div>
        <svg
          ref={svgRef}
          className={clsx(
            "w-full h-full strategy-chart select-none space-pressed overflow-hidden",
            brushColorClass,
            {
              readonly,
              "!cursor-grab": altPress,
              "!cursor-grabbing": altPress && zoom.isDragging,
            },
          )}
          viewBox={`0 0 ${width} ${height}`}
          onMouseOut={hideTooltip}
          onMouseMove={showCurrentPointTooltip}
          onWheel={handleWheel}
        >
          <Group>
            <AxisBottom
              top={innerHeight + margin.top}
              scale={zoomScale}
              tickFormat={(price) => Big(price.toString()).toFixed(2)}
              numTicks={8}
            />
          </Group>
          <Group>
            <AreaClosed<Offer>
              data={data}
              x={(d) => zoomScale(getXValue(d)) ?? 0}
              y={(d) => yScale(getYValue(d)) ?? 0}
              yScale={yScale}
              fill="#1B1F2F"
              strokeWidth={1}
              curve={curveStep}
            />
            {showCustomBrushZone ? (
              <>
                <rect
                  x={zoomScale(brushData.brushMinPrice)}
                  y={0}
                  width={minBrushOverlayWidth}
                  height={innerHeight + margin.top}
                  className="fill-custom-green opacity-20"
                  ref={leftRef}
                />
                <rect
                  x={xPositionMidPrice}
                  y={0}
                  width={maxBrushOverlayWidth}
                  height={innerHeight + margin.top}
                  className="fill-custom-red opacity-20"
                  ref={rightRef}
                />
              </>
            ) : undefined}
            <Brush
              key={timestamp}
              xScale={zoomScale}
              yScale={yScale}
              width={innerWidth}
              height={innerHeight + margin.top}
              disableDraggingSelection={readonly}
              useWindowMoveEvents
              initialBrushPosition={initialBrushPosition}
              resizeTriggerAreas={["left", "right"]}
              onChange={onBrushChange}
              onBrushStart={() => setBrushIsChanging(true)}
              onBrushEnd={() => {
                handleSelectionEnd()
              }}
              renderBrushHandle={(props) => (
                <BrushHandle
                  {...{
                    ...props,
                    margin,
                    innerHeight,
                    readonly,
                    brushData,
                    midPrice: midPrice.price,
                  }}
                />
              )}
            />
          </Group>

          <Group>
            <AxisRight
              left={0}
              scale={yScale}
              tickFormat={(volume) => Big(volume.toString()).toFixed(2)}
              numTicks={4}
              hideZero
            />
          </Group>
          {tooltipData && !overedOffer && (
            <Group>
              <Line
                from={{ x: tooltipLeft, y: 0 }}
                to={{ x: tooltipLeft, y: height }}
                stroke="#92949F"
                strokeWidth={1}
                pointerEvents="none"
                strokeDasharray="5, 5"
              />
              <Line
                from={{ x: 0, y: tooltipTop }}
                to={{ y: tooltipTop, x: width }}
                stroke="#92949F"
                strokeWidth={1}
                pointerEvents="none"
                strokeDasharray="5, 5"
              />
              <circle
                cx={tooltipLeft}
                cy={tooltipTop}
                r={6}
                fill="#92949F"
                pointerEvents="none"
              />
              <circle
                cx={tooltipLeft}
                cy={tooltipTop}
                r={5}
                fill="#fff"
                pointerEvents="none"
              />
            </Group>
          )}
          {altPress ? (
            <rect
              onMouseMove={(e) => {
                if (altPress) {
                  dragMove(e)
                  return
                }
              }}
              onMouseDown={(e) => {
                if (altPress) {
                  dragStart(e)
                  e.preventDefault()
                  return
                }
              }}
              onMouseUp={dragEnd}
              onMouseOut={dragEnd}
              width={width}
              height={height}
              fill="transparent"
            />
          ) : undefined}
          <Group>
            <Line
              from={{ x: xPositionMidPrice, y: 0 }}
              to={{ x: xPositionMidPrice, y: innerHeight + margin.top }}
              stroke="#92949F"
              strokeWidth={1}
              pointerEvents="none"
              strokeDasharray="5, 5"
            />
          </Group>
          {simulatedOffers?.length ? (
            <Group>
              {simulatedOffers.map(({ base, quote, offerType }) => {
                const price = quote.div(base)

                return (
                  <Circle
                    key={`${base.toString()}-${quote.toString()}`}
                    className={clsx("hover:opacity-80 transition-opacity", {
                      "fill-custom-green": offerType === "bids",
                      "fill-custom-red": offerType === "asks",
                    })}
                    cx={zoomScale(price.toNumber())}
                    cy={innerHeight}
                    r={3}
                  />
                )
              })}
            </Group>
          ) : undefined}
          {offers?.length ? (
            <Group>
              {offers.map((offer) => {
                const { live, offerId, offerType, price } = offer
                const isOvered =
                  overedOffer?.offerId === offerId &&
                  overedOffer?.offerType === offerType
                const dynamicProps = live
                  ? {
                      onMouseOver: () =>
                        overedOffer && !overedOffer.live
                          ? undefined
                          : setOveredOffer?.(offer),
                      onMouseLeave: () =>
                        overedOffer?.live && setOveredOffer?.(undefined),
                    }
                  : {
                      onClick: () =>
                        setOveredOffer?.(overedOffer ? undefined : offer),
                    }

                return (
                  <Circle
                    {...dynamicProps}
                    key={`${offerType}-${offerId}-${price?.toString() || 0}`}
                    className={clsx("transition-opacity", {
                      "fill-[#92949F] cursor-pointer ": !live,
                      "fill-custom-green": live && offerType === "bids",
                      "fill-custom-red": live && offerType === "asks",
                    })}
                    cx={zoomScale(price?.toNumber() || 0)}
                    cy={innerHeight}
                    r={isOvered ? 6 : 3}
                  />
                )
              })}
            </Group>
          ) : undefined}
        </svg>
        {midPrice ? (
          <div
            style={{
              top: margin.top + headerHeight,
              left: xPositionMidPrice,
            }}
            className="bg-[#1B1F2F] font-exo text-xs py-1 px-2 rounded-md !shadow-none absolute text-white -translate-x-1/2 mt-1 font-semibold whitespace-nowrap"
          >
            Current {(midPriceAsBig || Big(0)).toFixed(baseDecimals)}
          </div>
        ) : undefined}
        {brushData.brushMinPrice &&
        brushData.brushMaxPrice &&
        showMinMaxTooltips ? (
          <>
            <div
              style={{
                top: innerHeight + margin.top + headerHeight + 2,
                left: zoomScale(brushData.brushMinPrice),
              }}
              className={clsx(
                "font-exo text-xs py-1 px-2 rounded-md !shadow-none absolute text-white -translate-x-1/2 mt-1",
                brushData.brushMinPrice <= Big(midPriceAsBig || 0).toNumber()
                  ? "bg-custom-green"
                  : "bg-custom-red",
              )}
            >
              <div className="whitespace-nowrap font-exo font-semibold">
                Min{" "}
                {getFixedString(
                  brushData.brushMinPrice.toString(),
                  areClose(brushData.brushMinPrice, brushData.brushMaxPrice)
                    ? priceDecimals
                    : 2,
                )}{" "}
                {Big(brushData.brushMinPrice)
                  .minus(midPriceAsBig || Big(0))
                  .div(midPriceAsBig || Big(0))
                  .mul(100)
                  .toFixed(1)}{" "}
                %
              </div>
            </div>
            <div
              style={{
                top: innerHeight + margin.top + headerHeight + 2,
                left: zoomScale(brushData.brushMaxPrice),
              }}
              className={clsx(
                "font-exo text-xs py-1 px-2 rounded-md !shadow-none absolute text-white -translate-x-1/2 mt-1",
                brushData.brushMaxPrice >= Big(midPriceAsBig || 0).toNumber()
                  ? "bg-custom-red"
                  : "bg-custom-green",
              )}
            >
              <div className="whitespace-nowrap font-exo font-semibold">
                Max{" "}
                {getFixedString(
                  brushData.brushMaxPrice.toString(),
                  areClose(brushData.brushMinPrice, brushData.brushMaxPrice)
                    ? priceDecimals
                    : 2,
                )}{" "}
                {Big(brushData.brushMaxPrice)
                  .minus(midPriceAsBig || Big(0))
                  .div(midPriceAsBig || Big(0))
                  .mul(100)
                  .toFixed(1)}{" "}
                %
              </div>
            </div>
          </>
        ) : undefined}
        {tooltipData && !overedOffer ? (
          <TooltipWithBounds
            top={margin.top + headerHeight}
            left={tooltipLeft}
            className="text-black text-xs font-semibold font-exo px-2 py-1 space-y-2"
          >
            <div className="">
              Price: {(tooltipData?.price || Big(0)).toFixed(priceDecimals)}{" "}
              {quoteSymbol}
            </div>
            <div className="">
              Volume: {getYValue(tooltipData).toFixed(baseDecimals)}{" "}
              {baseSymbol}
            </div>
          </TooltipWithBounds>
        ) : undefined}
        {overedOffer ? (
          <TooltipWithBounds
            top={innerHeight - 30}
            left={zoomScale(overedOffer.price?.toNumber() || 0)}
            className={clsx(
              "!text-white text-xs font-semibold font-exo px-2 py-1 space-y-2",
              {
                "!bg-custom-grey": !overedOffer.live,
                "!bg-custom-green":
                  overedOffer.live && overedOffer.offerType === "bids",
                "!bg-custom-red":
                  overedOffer.live && overedOffer.offerType === "asks",
              },
            )}
          >
            <div className="flex justify-between p-1">
              {!overedOffer.live && (
                <div className="absolute top-0 right-0 pt-1 pr-1 pointer-events-auto cursor-pointer">
                  <X
                    className="w-5 h-5 text-[#92949F] cursor-pointer hover:text-white transition-colors"
                    onClick={() => setOveredOffer?.(undefined)}
                  />
                </div>
              )}
              <div className="grid space-y-1">
                <div>
                  {overedOffer.live ? "Live" : "Empty"}{" "}
                  {overedOffer?.offerType === "bids" ? "bid" : "ask"}
                </div>
                <div className={`${!overedOffer.live ? "text-gray-400" : ""}`}>
                  Price: {(overedOffer.price || Big(0)).toFixed(priceDecimals)}{" "}
                  {quoteSymbol}
                </div>
                {overedOffer.base && (
                  <div
                    className={`${!overedOffer.live ? "text-gray-400" : ""}`}
                  >
                    Volume: {Big(overedOffer.base).toFixed(baseDecimals)}{" "}
                    {baseSymbol}
                  </div>
                )}

                {!overedOffer.live && (
                  <div className="pointer-events-auto">
                    <Button
                      onClick={() => {
                        overedOffer.offerId &&
                          refill?.(setReFillLoading, overedOffer.offerId)
                      }}
                      size={"medium"}
                      className="rounded-sm w-full"
                      disabled={reFillLoading}
                    >
                      {!reFillLoading ? (
                        "reFill"
                      ) : (
                        <Spinner
                          iconType="spinner"
                          className="w-4 h-4 m-auto"
                        />
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </TooltipWithBounds>
        ) : undefined}
      </div>
    )
  },
)

type Props = Omit<ChartProps, "zoom" | "bounds">

export default function ChartWithZoom(props: Props) {
  const [ref, bounds] = useMeasure()
  const width = bounds.width || defaultWidth
  const height = bounds.height || defaultHeight

  return (
    <div
      ref={ref}
      className="w-auto h-auto min-h-[285px] max-h-[25vh] mb-[76px] col-span-full"
      style={{ height: height }}
    >
      <Zoom width={width} height={height} scaleXMin={0.1} scaleXMax={40}>
        {(zoom) => <Chart {...{ ...props, zoom, bounds }} />}
      </Zoom>
    </div>
  )
}
