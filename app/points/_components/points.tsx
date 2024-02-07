import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { MangroveLogo, TooltipInfo } from "@/svgs"

export default function Points() {
  return (
    <div className="space-y-1">
      <div className="text-sm text-cloud-200">Total points</div>
      <div className="flex space-x-4 items-center">
        <MangroveLogo />
        <span className="text-5xl font-medium mt-1">12045</span>
      </div>
      <div className="text-xs text-cloud-200 flex items-center pt-11">
        update in 22h 10m{" "}
        <TooltipProvider>
          <Tooltip delayDuration={200}>
            <TooltipTrigger className="hover:opacity-80 transition-opacity ml-0.5">
              <TooltipInfo />
            </TooltipTrigger>
            <TooltipContent>
              Your total points, recalculated every 24 hours.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}
