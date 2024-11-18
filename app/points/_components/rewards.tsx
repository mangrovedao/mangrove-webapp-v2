import { useAccount } from "wagmi"

import InfoTooltip from "@/components/info-tooltip"
import { MangroveLogo } from "@/svgs"
import { cn } from "@/utils"
import { formatNumber } from "@/utils/numbers"
import { useEpochLeaderboard } from "./leaderboard/use-epoch-leaderboard"

export default function Rewards() {
  const { address: account } = useAccount()

  const totalLeaderboardQuery = useEpochLeaderboard({
    epoch: "total",
  })

  const accountTotalQuery = useEpochLeaderboard({
    epoch: "total",
    account,
  })

  const totalPoints = Number(
    accountTotalQuery.data?.leaderboard?.[0]?.total ?? 0,
  )

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
          {formatNumber(totalPoints)}
        </span>
      </div>
      <div className="text-xs text-cloud-200 flex items-center pt-11">
        update every 7 days
        {/* update in {timeUntilNextUpdate} */}
        <InfoTooltip>Your total points, recalculated every 7 days.</InfoTooltip>
      </div>
    </div>
  )
}
