"use client"
import { Button } from "@/components/ui/button"
import { Alignment, Fit, Layout, useRive } from "@rive-app/react-canvas-lite"
import React from "react"
import { ActionsTabs } from "../utils/types"

export const ACTIONS = [
  {
    title: ActionsTabs.KANDEL,
    description:
      "Take advantage of market volatility with your own instances of Kandel",
    href: "/strategies",
    imageUrl: "/assets/more/kandel.webp",
    riveUrl: "/assets/rive/kandel.riv",
    timeline: "Timeline 1",
    disabled: true,
  },
  {
    title: ActionsTabs.BRIDGE,
    description: "Send your assets accross chains, without leaving the app",
    href: "/bridge",
    imageUrl: "/assets/more/bridge.webp",
    riveUrl: "/assets/rive/bridge.riv",
    timeline: "Timeline 1",
  },
  {
    title: ActionsTabs.WRAP,
    description: "Wrap ETH into wETH, in order to trade ETH as an ERC20 token",
    href: "/wrap",
    imageUrl: "/assets/more/wrap.webp",
    riveUrl: "/assets/rive/wrap.riv",
    timeline: "Timeline 1",
  },
]

export default function QuickActions() {
  return (
    <div className="grid grid-cols-6 gap-4">
      {ACTIONS.map((action) => (
        <Card action={action} key={action.title} />
      ))}
    </div>
  )
}

function Card({ action }: { action: (typeof ACTIONS)[number] }) {
  const [isHovered, setIsHovered] = React.useState(false)

  return (
    <div
      className="w-full bg-bg-secondary rounded-2xl overflow-hidden col-span-6 sm:col-span-3 md:col-span-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="object-cover scale-[1.02] w-full h-80 max-h-[200px] md:max-h-none">
        <Anim
          src={action.riveUrl}
          stateMachines="Timeline 1"
          autoplay={false}
          layout={
            new Layout({
              fit: Fit.Cover,
              alignment: Alignment.TopCenter,
            })
          }
          isHovered={isHovered}
        />
      </div>
      <div className="pt-6 pb-5 px-5 text-center">
        <h1 className="md:text-2xl text-lg font-semibold">{action.title}</h1>
        <p className="md:text-base text-sm md:mt-5 md:mb-6 mt-3 mb-4 text-text-secondary">
          {action.description}
        </p>
        {action.disabled ? (
          <Button disabled={true}>Start</Button>
        ) : (
          <Button
            onClick={() => {
              dispatchEvent(
                new CustomEvent("on-more-tab-clicked", {
                  detail: { tab: action.title },
                }),
              )
            }}
          >
            Start
          </Button>
        )}
      </div>
    </div>
  )
}

function Anim({
  src,
  stateMachines,
  autoplay = true,
  layout,
  isHovered,
}: {
  src: string
  stateMachines?: string | string[] | undefined
  autoplay?: boolean
  layout?: Layout | undefined
  isHovered: boolean
}) {
  const { rive, RiveComponent } = useRive({
    src,
    stateMachines,
    autoplay,
    layout,
  })

  React.useEffect(() => {
    if (isHovered) {
      rive?.play()
    } else {
      rive?.pause()
    }
  }, [isHovered])

  return <RiveComponent />
}
