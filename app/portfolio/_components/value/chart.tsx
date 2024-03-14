"use client"

import { cn } from "@/utils"
import clsx from "clsx"
import { ColorType, IChartApi, Time, createChart } from "lightweight-charts"
import { useEffect, useRef, useState } from "react"

const initialData = {
  "1710403200000": [{ symbol: "ETH", amount: 0.1512, total_value: 599.557896 }],
  "1710399600000": [{ symbol: "ETH", amount: 0.1512, total_value: 601.776 }],
  "1710396000000": [{ symbol: "ETH", amount: 0.1512, total_value: 600.459048 }],
  "1710392400000": [{ symbol: "ETH", amount: 0.1512, total_value: 598.352832 }],
  "1710388800000": [{ symbol: "ETH", amount: 0.1512, total_value: 603.895824 }],
  "1710385200000": [{ symbol: "ETH", amount: 0.1512, total_value: 602.854056 }],
  "1710381600000": [{ symbol: "ETH", amount: 0.1512, total_value: 602.545608 }],
  "1710378000000": [{ symbol: "ETH", amount: 0.1512, total_value: 600.108264 }],
  "1710374400000": [{ symbol: "ETH", amount: 0.1512, total_value: 605.723832 }],
  "1710370800000": [{ symbol: "ETH", amount: 0.1512, total_value: 602.867664 }],
  "1710367200000": [{ symbol: "ETH", amount: 0.1512, total_value: 605.7828 }],
  "1710363600000": [{ symbol: "ETH", amount: 0.1512, total_value: 603.442224 }],
  "1710360000000": [{ symbol: "ETH", amount: 0.1512, total_value: 605.71476 }],
  "1710356400000": [{ symbol: "ETH", amount: 0.1512, total_value: 605.983896 }],
  "1710352800000": [{ symbol: "ETH", amount: 0.1512, total_value: 602.565264 }],
  "1710349200000": [{ symbol: "ETH", amount: 0.1512, total_value: 602.621208 }],
  "1710345600000": [{ symbol: "ETH", amount: 0.1512, total_value: 600.40764 }],
  "1710342000000": [{ symbol: "ETH", amount: 0.1512, total_value: 600.8688 }],
  "1710338400000": [{ symbol: "ETH", amount: 0.1512, total_value: 600.070464 }],
  "1710334800000": [{ symbol: "ETH", amount: 0.1512, total_value: 606.612888 }],
  "1710331200000": [{ symbol: "ETH", amount: 0.1512, total_value: 612.558072 }],
  "1710327600000": [{ symbol: "ETH", amount: 0.1512, total_value: 613.5696 }],
  "1710324000000": [{ symbol: "ETH", amount: 0.1512, total_value: 612.502128 }],
  "1710320400000": [{ symbol: "ETH", amount: 0.1512, total_value: 614.806416 }],
  "1710316800000": [{ symbol: "ETH", amount: 0.1512, total_value: 610.826832 }],
  "1710313200000": [{ symbol: "ETH", amount: 0.1512, total_value: 612.096912 }],
  "1710309600000": [{ symbol: "ETH", amount: 0.1512, total_value: 610.622712 }],
  "1710306000000": [{ symbol: "ETH", amount: 0.1512, total_value: 611.251704 }],
  "1710302400000": [{ symbol: "ETH", amount: 0.1512, total_value: 611.554104 }],
  "1710298800000": [{ symbol: "ETH", amount: 0.1512, total_value: 609.957432 }],
  "1710295200000": [{ symbol: "ETH", amount: 0.1512, total_value: 608.1264 }],
  "1710291600000": [{ symbol: "ETH", amount: 0.1512, total_value: 601.777512 }],
  "1710288000000": [{ symbol: "ETH", amount: 0.1512, total_value: 602.417088 }],
  "1710284400000": [{ symbol: "ETH", amount: 0.1512, total_value: 597.305016 }],
  "1710280800000": [{ symbol: "ETH", amount: 0.1512, total_value: 595.275912 }],
  "1710277200000": [{ symbol: "ETH", amount: 0.1512, total_value: 597.53484 }],
  "1710273600000": [{ symbol: "ETH", amount: 0.1512, total_value: 601.955928 }],
  "1710270000000": [{ symbol: "ETH", amount: 0.1512, total_value: 600.13548 }],
  "1710266400000": [{ symbol: "ETH", amount: 0.1512, total_value: 598.446576 }],
  "1710262800000": [{ symbol: "ETH", amount: 0.1512, total_value: 593.6112 }],
  "1710259200000": [{ symbol: "ETH", amount: 0.1512, total_value: 603.473976 }],
  "1710255600000": [{ symbol: "ETH", amount: 0.1512, total_value: 599.79528 }],
  "1710252000000": [{ symbol: "ETH", amount: 0.1512, total_value: 608.498352 }],
  "1710248400000": [{ symbol: "ETH", amount: 0.1512, total_value: 608.55732 }],
  "1710244800000": [{ symbol: "ETH", amount: 0.1512, total_value: 608.561856 }],
  "1710241200000": [{ symbol: "ETH", amount: 0.1512, total_value: 606.250008 }],
  "1710237600000": [{ symbol: "ETH", amount: 0.1512, total_value: 606.113928 }],
  "1710234000000": [{ symbol: "ETH", amount: 0.1512, total_value: 603.130752 }],
  "1710230400000": [{ symbol: "ETH", amount: 0.1512, total_value: 610.007328 }],
  "1710226800000": [{ symbol: "ETH", amount: 0.1512, total_value: 609.286104 }],
  "1710223200000": [{ symbol: "ETH", amount: 0.1512, total_value: 610.90092 }],
  "1710219600000": [{ symbol: "ETH", amount: 0.1512, total_value: 610.29612 }],
  "1710216000000": [{ symbol: "ETH", amount: 0.1512, total_value: 609.384384 }],
  "1710212400000": [{ symbol: "ETH", amount: 0.1512, total_value: 612.890712 }],
  "1710208800000": [{ symbol: "ETH", amount: 0.1512, total_value: 614.00052 }],
  "1710205200000": [{ symbol: "ETH", amount: 0.1512, total_value: 614.01564 }],
  "1710201600000": [{ symbol: "ETH", amount: 0.1512, total_value: 615.630456 }],
  "1710198000000": [{ symbol: "ETH", amount: 0.1512, total_value: 614.84724 }],
  "1710194400000": [{ symbol: "ETH", amount: 0.1512, total_value: 612.933048 }],
  "1710190800000": [{ symbol: "ETH", amount: 0.1512, total_value: 609.5628 }],
  "1710187200000": [{ symbol: "ETH", amount: 0.1512, total_value: 610.093512 }],
  "1710183600000": [{ symbol: "ETH", amount: 0.1512, total_value: 612.961776 }],
  "1710180000000": [{ symbol: "ETH", amount: 0.1512, total_value: 610.911504 }],
  "1710176400000": [{ symbol: "ETH", amount: 0.1512, total_value: 611.3016 }],
  "1710172800000": [{ symbol: "ETH", amount: 0.1512, total_value: 608.581512 }],
  "1710169200000": [{ symbol: "ETH", amount: 0.1512, total_value: 610.268904 }],
  "1710165600000": [{ symbol: "ETH", amount: 0.1512, total_value: 608.596632 }],
  "1710162000000": [{ symbol: "ETH", amount: 0.1512, total_value: 613.295928 }],
  "1710158400000": [{ symbol: "ETH", amount: 0.1512, total_value: 609.596064 }],
  "1710154800000": [{ symbol: "ETH", amount: 0.1512, total_value: 608.696424 }],
  "1710151200000": [{ symbol: "ETH", amount: 0.1512, total_value: 610.47 }],
  "1710147600000": [{ symbol: "ETH", amount: 0.1512, total_value: 607.439952 }],
  "1710144000000": [{ symbol: "ETH", amount: 0.1512, total_value: 607.116384 }],
  "1710140400000": [{ symbol: "ETH", amount: 0.1512, total_value: 588.37968 }],
  "1710136800000": [{ symbol: "ETH", amount: 0.1512, total_value: 582.071616 }],
  "1710133200000": [{ symbol: "ETH", amount: 0.1512, total_value: 583.560936 }],
  "1710129600000": [{ symbol: "ETH", amount: 0.1512, total_value: 584.53164 }],
  "1710126000000": [{ symbol: "ETH", amount: 0.1512, total_value: 580.140792 }],
  "1710122400000": [{ symbol: "ETH", amount: 0.1512, total_value: 577.733688 }],
  "1710118800000": [{ symbol: "ETH", amount: 0.1512, total_value: 578.562264 }],
  "1710115200000": [{ symbol: "ETH", amount: 0.1512, total_value: 586.654488 }],
  "1710111600000": [{ symbol: "ETH", amount: 0.1512, total_value: 578.840472 }],
  "1710108000000": [{ symbol: "ETH", amount: 0.1512, total_value: 587.412 }],
  "1710104400000": [{ symbol: "ETH", amount: 0.1512, total_value: 590.691528 }],
  "1710100800000": [{ symbol: "ETH", amount: 0.1512, total_value: 590.588712 }],
  "1710097200000": [{ symbol: "ETH", amount: 0.1512, total_value: 590.026248 }],
  "1710093600000": [{ symbol: "ETH", amount: 0.1512, total_value: 592.785648 }],
  "1710090000000": [{ symbol: "ETH", amount: 0.1512, total_value: 591.36588 }],
  "1710086400000": [{ symbol: "ETH", amount: 0.1512, total_value: 588.819672 }],
  "1710082800000": [{ symbol: "ETH", amount: 0.1512, total_value: 589.9824 }],
  "1710079200000": [{ symbol: "ETH", amount: 0.1512, total_value: 590.121504 }],
  "1710075600000": [{ symbol: "ETH", amount: 0.1512, total_value: 595.124712 }],
  "1710072000000": [{ symbol: "ETH", amount: 0.1512, total_value: 595.767312 }],
  "1710068400000": [{ symbol: "ETH", amount: 0.1512, total_value: 596.691144 }],
  "1710064800000": [{ symbol: "ETH", amount: 0.1512, total_value: 598.32108 }],
  "1710061200000": [{ symbol: "ETH", amount: 0.1512, total_value: 599.672808 }],
  "1710057600000": [{ symbol: "ETH", amount: 0.1512, total_value: 597.865968 }],
  "1710054000000": [{ symbol: "ETH", amount: 0.1512, total_value: 596.93004 }],
  "1710050400000": [{ symbol: "ETH", amount: 0.1512, total_value: 596.384964 }],
  "1710046800000": [{ symbol: "ETH", amount: 0.1512, total_value: 597.069144 }],
  "1710043200000": [{ symbol: "ETH", amount: 0.1512, total_value: 596.15136 }],
  "1710039600000": [{ symbol: "ETH", amount: 0.1512, total_value: 592.988256 }],
  "1710036000000": [{ symbol: "ETH", amount: 0.1512, total_value: 595.390824 }],
  "1710032400000": [{ symbol: "ETH", amount: 0.1512, total_value: 592.587576 }],
  "1710028800000": [{ symbol: "ETH", amount: 0.1512, total_value: 591.851232 }],
  "1710025200000": [{ symbol: "ETH", amount: 0.1512, total_value: 592.075008 }],
  "1710021600000": [{ symbol: "ETH", amount: 0.1512, total_value: 591.430896 }],
  "1710018000000": [{ symbol: "ETH", amount: 0.1512, total_value: 591.0786 }],
  "1710014400000": [{ symbol: "ETH", amount: 0.1512, total_value: 588.093912 }],
  "1710010800000": [{ symbol: "ETH", amount: 0.1512, total_value: 589.841784 }],
  "1710007200000": [{ symbol: "ETH", amount: 0.1512, total_value: 587.877696 }],
  "1710003600000": [{ symbol: "ETH", amount: 0.1512, total_value: 588.482496 }],
  "1710000000000": [{ symbol: "ETH", amount: 0.1512, total_value: 593.803224 }],
  "1709996400000": [{ symbol: "ETH", amount: 0.1512, total_value: 592.65108 }],
  "1709992800000": [{ symbol: "ETH", amount: 0.1512, total_value: 593.8758 }],
  "1709989200000": [{ symbol: "ETH", amount: 0.1512, total_value: 593.538624 }],
  "1709985600000": [{ symbol: "ETH", amount: 0.1512, total_value: 592.865784 }],
  "1709982000000": [{ symbol: "ETH", amount: 0.1512, total_value: 592.433352 }],
  "1709978400000": [{ symbol: "ETH", amount: 0.1512, total_value: 593.856144 }],
  "1709974800000": [{ symbol: "ETH", amount: 0.1512, total_value: 594.671112 }],
  "1709971200000": [{ symbol: "ETH", amount: 0.1512, total_value: 595.192752 }],
  "1709967600000": [{ symbol: "ETH", amount: 0.1512, total_value: 596.60496 }],
  "1709964000000": [{ symbol: "ETH", amount: 0.1512, total_value: 593.788104 }],
  "1709960400000": [{ symbol: "ETH", amount: 0.1512, total_value: 594.634824 }],
  "1709956800000": [{ symbol: "ETH", amount: 0.1512, total_value: 594.643896 }],
  "1709953200000": [{ symbol: "ETH", amount: 0.1512, total_value: 593.933256 }],
  "1709949600000": [{ symbol: "ETH", amount: 0.1512, total_value: 591.329592 }],
  "1709946000000": [{ symbol: "ETH", amount: 0.1512, total_value: 591.768072 }],
  "1709942400000": [{ symbol: "ETH", amount: 0.1512, total_value: 588.671496 }],
  "1709938800000": [{ symbol: "ETH", amount: 0.1512, total_value: 588.722904 }],
  "1709935200000": [{ symbol: "ETH", amount: 0.1512, total_value: 591.612336 }],
  "1709931600000": [{ symbol: "ETH", amount: 0.1512, total_value: 596.74104 }],
  "1709928000000": [{ symbol: "ETH", amount: 0.1512, total_value: 594.879768 }],
  "1709924400000": [{ symbol: "ETH", amount: 0.1512, total_value: 595.38024 }],
  "1709920800000": [{ symbol: "ETH", amount: 0.1512, total_value: 597.212784 }],
  "1709917200000": [{ symbol: "ETH", amount: 0.1512, total_value: 591.399144 }],
  "1709913600000": [{ symbol: "ETH", amount: 0.1512, total_value: 591.253992 }],
  "1709910000000": [{ symbol: "ETH", amount: 0.1512, total_value: 602.132832 }],
  "1709906400000": [{ symbol: "ETH", amount: 0.1512, total_value: 601.323912 }],
  "1709902800000": [{ symbol: "ETH", amount: 0.1512, total_value: 597.335256 }],
  "1709899200000": [{ symbol: "ETH", amount: 0.1512, total_value: 597.501576 }],
}
const backgroundColor = "#041010",
  lineColor = "#03624C80",
  textColor = "#7B8888",
  areaTopColor = "#03624C50",
  areaBottomColor = "#03624C10"

export default function OverviewChart() {
  const [selectedFilter, setSelectedFilter] = useState(0)
  const chartContainerRef = useRef<HTMLDivElement>(null)
  let chart: IChartApi | null = null

  const convertDataForChart = (initialData: {
    [key: string]: { symbol: string; amount: number; total_value: number }[]
  }) => {
    let convertedData = [] as { time: Time; value: number }[]
    const timestamps = Object.keys(initialData).sort(
      (a, b) => parseInt(a) - parseInt(b),
    )
    for (let timestamp of timestamps) {
      initialData[timestamp]!.forEach((data) => {
        convertedData.push({
          time: (parseInt(timestamp) / 1000) as Time,
          value: data.total_value,
        })
      })
    }

    return convertedData
  }

  useEffect(() => {
    if (!chartContainerRef.current) return

    const handleResize = () => {
      if (!chartContainerRef.current) return
      chart?.applyOptions({ width: chartContainerRef.current.clientWidth })
    }

    chart = createChart(chartContainerRef.current, {
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
        vertLine: {
          color: "#03624C80",
        },
        horzLine: { color: "#03624C80" },
      },
      rightPriceScale: {
        borderVisible: false,
      },
      timeScale: {
        borderVisible: false,
        timeVisible: true,
        secondsVisible: false,
      },
    })
    chart.timeScale().fitContent()

    const newSeries1 = chart.addAreaSeries({
      lineColor,
      lineWidth: 1,
      priceLineVisible: false,
      topColor: areaTopColor,
      bottomColor: areaBottomColor,
    })
    const chartData = convertDataForChart(initialData)
    newSeries1.setData(chartData)

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      chart?.remove()
      chart = null
    }
  }, [
    initialData,
    backgroundColor,
    lineColor,
    textColor,
    areaTopColor,
    areaBottomColor,
  ])

  const onFilter = (value: number) => {
    // setSelectedFilter(value)
    chart?.timeScale().scrollToPosition(value, true)
  }

  return (
    <div className="p-6 flex flex-col justify-between h-full">
      <div className="flex space-x-2">
        <span
          role="button"
          onClick={() => onFilter(0)}
          className={cn(
            "w-12 py-0.5 text-center text-sm rounded-full",
            selectedFilter === 0 && "border border-green-caribbean",
          )}
        >
          0.5h
        </span>
        <span
          role="button"
          onClick={() => onFilter(1)}
          className={cn(
            "w-12 py-0.5 text-center text-sm rounded-full",
            selectedFilter === 1 && "border border-green-caribbean",
          )}
        >
          1h
        </span>
        <span
          role="button"
          onClick={() => onFilter(2)}
          className={cn(
            "w-12 py-0.5 text-center text-sm rounded-full",
            selectedFilter === 2 && "border border-green-caribbean",
          )}
        >
          4h
        </span>
        <span
          role="button"
          onClick={() => onFilter(3)}
          className={cn(
            "w-12 py-0.5 text-center text-sm rounded-full",
            selectedFilter === 3 && "border border-green-caribbean",
          )}
        >
          1d
        </span>
        <span
          role="button"
          onClick={() => onFilter(4)}
          className={cn(
            "w-12 py-0.5 text-center text-sm rounded-full",
            selectedFilter === 4 && "border border-green-caribbean",
          )}
        >
          7d
        </span>
        <span
          role="button"
          onClick={() => onFilter(5)}
          className={cn(
            "w-12 py-0.5 text-center text-sm rounded-full",
            selectedFilter === 5 && "border border-green-caribbean",
          )}
        >
          1m
        </span>
      </div>

      <div ref={chartContainerRef} />
    </div>
  )
}
