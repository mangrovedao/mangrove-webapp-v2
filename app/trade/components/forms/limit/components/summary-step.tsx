import { TokenIcon } from "@/components/token-icon"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/utils"

export function SummaryStep() {
  return (
    <div className="bg-[#041010] rounded-lg p-4 space-y-4">
      <div className="flex items-center space-x-2">
        <div className="flex -space-x-2">
          <TokenIcon className="w-7 h-auto" symbol={"WETH"} />
          <TokenIcon className="w-7 h-auto" symbol={"USDC"} />
        </div>
        <span className="text-white text-xl font-medium">WETH / USDC</span>
      </div>
      <Separator />
      <div className="space-y-4">
        <Line title="Limit Price">
          1234.6578 <Unit>USDC</Unit>
        </Line>
        <Line title="Send from wallet">
          11.6578 <Unit>USDC</Unit>
        </Line>
        <Line title="Receive to wallet">
          1.56 <Unit>ETH</Unit>
        </Line>
        <Line title="Est. Provision">
          0.2503 <Unit>MATIC</Unit>
        </Line>
        <Line title="Time in force">
          <div className="flex flex-col items-end">
            Good till time <Unit>5 days</Unit>
          </div>
        </Line>
      </div>
    </div>
  )
}

type Props = {
  title: string
}
function Line({
  title,
  children,
  className,
}: Props & { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("w-full flex justify-between text-base", className)}>
      <span>{title}</span>
      <span className="text-white">{children}</span>
    </div>
  )
}

function Unit({ children }: { children: React.ReactNode }) {
  return <span className="text-gray-scale-300">{children}</span>
}
