import InfoTooltip from "@/components/info-tooltip"
import { MangroveLogo } from "@/svgs"
import { cn } from "@/utils"

type Props = {
  points?: number
}

export default function Points({ points = 12450 }: Props) {
  return (
    <div className="space-y-1">
      <div className="text-sm text-cloud-200">Total points</div>
      <div className="flex space-x-4 items-center">
        <MangroveLogo className={cn(!points && "opacity-50")} />
        <span
          className={cn("text-5xl font-medium mt-1", {
            "text-cloud-00": !points,
          })}
        >
          {points}
        </span>
      </div>
      <div className="text-xs text-cloud-200 flex items-center pt-11">
        update in 22h 10m{" "}
        <InfoTooltip>
          Your total points, recalculated every 24 hours.
        </InfoTooltip>
      </div>
    </div>
  )
}
