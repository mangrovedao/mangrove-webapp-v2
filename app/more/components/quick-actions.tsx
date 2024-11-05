import { Button } from "@/components/ui/button"
import Link from "next/link"

const ACTIONS = [
  {
    title: "Kandel",
    description:
      "Take advantage of market volatility with your own instances of Kandel",
    href: "/strategies",
    imageUrl: "/assets/more/kandel.webp",
  },
  {
    title: "Bridge",
    description: "Send your assets accross chains, without leaving the app",
    href: "/bridge",
    imageUrl: "/assets/more/bridge.webp",
  },
  {
    title: "Wrap",
    description: "Wrap ETH into wETH, in order to trade ETH as an ERC20 token",
    href: "/wrap",
    imageUrl: "/assets/more/wrap.webp",
  },
]

export default function QuickActions() {
  return (
    <div className="grid grid-cols-6 gap-4 mt-8">
      {ACTIONS.map((action) => (
        <div className="w-full bg-bg-secondary rounded-2xl overflow-hidden col-span-6 sm:col-span-3 md:col-span-2">
          <img
            src={action.imageUrl}
            alt="Kandel"
            className="object-cover scale-[1.02] w-full max-h-[200px] md:max-h-none"
          />
          <div className="flex flex-col items-center text-center px-3 py-4 md:px-5 md:py-6">
            <h1 className="font-semibold text-lg md:text-[25px]">
              {action.title}
            </h1>
            <p className="md:text-base text-sm md:mt-5 md:mb-6 mt-3 mb-4 text-text-secondary">
              {action.description}
            </p>
            <Button asChild>
              <Link href={action.href}>Start</Link>
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
