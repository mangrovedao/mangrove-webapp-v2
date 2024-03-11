"use client"

import { ColorType, createChart } from "lightweight-charts"
import { useEffect, useRef } from "react"

const initialData = [
  { time: "2018-12-15", value: 22.51 },
  { time: "2018-12-16", value: 11.51 },
  { time: "2018-12-17", value: 32.51 },
  { time: "2018-12-18", value: 21.51 },
  { time: "2018-12-19", value: 23.51 },
  { time: "2018-12-20", value: 32.51 },
  { time: "2018-12-21", value: 30.51 },
  { time: "2018-12-22", value: 32.51 },
  { time: "2018-12-23", value: 31.11 },
  { time: "2018-12-24", value: 27.02 },
  { time: "2018-12-25", value: 27.32 },
  { time: "2018-12-26", value: 25.17 },
  { time: "2018-12-27", value: 28.89 },
  { time: "2018-12-28", value: 25.46 },
  { time: "2018-12-29", value: 23.92 },
  { time: "2018-12-30", value: 22.68 },
  { time: "2018-12-31", value: 22.67 },
]

export default function OverviewChart() {
  const {
    colors: {
      backgroundColor = "#041010",
      lineColor = "#03624C80",
      textColor = "#7B8888",
      areaTopColor = "#03624C50",
      areaBottomColor = "#03624C10",
    } = {},
  } = {}
  const chartContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!chartContainerRef.current) return

    const handleResize = () => {
      if (!chartContainerRef.current) return
      chart.applyOptions({ width: chartContainerRef.current.clientWidth })
    }

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: backgroundColor },
        textColor,
      },
      width: chartContainerRef.current.clientWidth,
      height: 300,
      grid: {
        vertLines: { color: "#03624C05" },
        horzLines: { color: "#03624C05" },
      },
      crosshair: {
        vertLine: { color: "#03624C80" },
        horzLine: { color: "#03624C80" },
      },
    })
    chart.timeScale().fitContent()

    const newSeries = chart.addAreaSeries({
      lineColor,
      lineWidth: 1,
      priceLineVisible: false,
      topColor: areaTopColor,
      bottomColor: areaBottomColor,
    })
    newSeries.setData(initialData)
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      chart.remove()
    }
  }, [
    initialData,
    backgroundColor,
    lineColor,
    textColor,
    areaTopColor,
    areaBottomColor,
  ])

  return (
    <div className="p-6 flex flex-col justify-between h-full">
      <div className="flex space-x-2">
        <span className="w-12 py-0.5 text-center text-cloud-200 text-sm rounded-full border">
          0.5h
        </span>
        <span className="w-12 py-0.5 text-center text-cloud-200 text-sm rounded-full border">
          1h
        </span>
        <span className="w-12 py-0.5 text-center text-cloud-200 text-sm rounded-full border">
          4h
        </span>
        <span className="w-12 py-0.5 text-center text-sm rounded-full border border-green-caribbean">
          1d
        </span>
        <span className="w-12 py-0.5 text-center text-cloud-200 text-sm rounded-full border">
          7d
        </span>
        <span className="w-12 py-0.5 text-center text-cloud-200 text-sm rounded-full border">
          1m
        </span>
      </div>

      <div ref={chartContainerRef} />
    </div>
  )
}
