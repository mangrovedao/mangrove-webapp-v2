import { addDays, formatDistanceToNow } from "date-fns"

import InfoTooltip from "@/components/info-tooltip"
import { MangroveLogo } from "@/svgs"
import { cn } from "@/utils"
import { useUserPoints } from "./leaderboard/use-leaderboard"

export default function Rewards() {
  const { data: userPoints } = useUserPoints()
  const totalPoints = Number(userPoints?.total_points ?? 0)

  const latestUpdatedDate = userPoints
    ? new Date(userPoints.last_updated_timestamp)
    : undefined
  const nextUpdateDate = latestUpdatedDate
    ? addDays(latestUpdatedDate, 1)
    : undefined

  const timeUntilNextUpdate = nextUpdateDate
    ? formatDistanceToNow(nextUpdateDate, { includeSeconds: true })
    : ""

  return (
    <div className="space-y-1">
      <div className="text-sm text-cloud-200">Total points</div>
      <div className="flex space-x-4 items-center">
        <MangroveLogo
          className={cn({
            "opacity-50": !totalPoints,
          })}
        />
        <span
          className={cn("text-5xl font-medium mt-1", {
            "text-cloud-00": !totalPoints,
          })}
        >
          {totalPoints}
        </span>
      </div>
      <div className="text-xs text-cloud-200 flex items-center pt-11">
        update in {timeUntilNextUpdate} {/* update in 22h 10m{" "} */}
        <InfoTooltip>
          Your total points, recalculated every 24 hours.
        </InfoTooltip>
      </div>
    </div>
  )
}
