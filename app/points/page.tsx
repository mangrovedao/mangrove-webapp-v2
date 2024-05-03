"use client"

import { useAccount } from "wagmi"

import { Caption } from "@/components/typography/caption"
import { cn } from "@/utils"
import { Settings, X } from "lucide-react"
import { useLocalStorage } from "usehooks-ts"
import { ConnectWalletBanner } from "./_components/connect-wallet-banner"
import CurrentBoost from "./_components/current-boost"
import { JoinProgramBanner } from "./_components/join-program-banner"
import { Leaderboard } from "./_components/leaderboard/table"
import {
  useUserBoosts,
  useUserPoints,
} from "./_components/leaderboard/use-leaderboard"
import NextLevel from "./_components/next-level"
import Rank from "./_components/rank"
import Rewards from "./_components/rewards"
import TotalPoints from "./_components/total-points"

export default function Page() {
  const { isConnected } = useAccount()
  const { data: userBoosts } = useUserBoosts()
  const { data: userPoints } = useUserPoints()
  const userBoost = userBoosts?.[0]
  const volumeBoost = Number(userPoints?.boost ?? 1)
  const highestBoost = Number(
    userBoosts?.reduce(
      (prev, current) => {
        return prev.boost > current.boost ? prev : current
      },
      { boost: 1 },
    )?.boost ?? 1,
  )
  // FIXME: workaround to show the highest boost to the user because the API is not handling that for now
  const currentBoost = volumeBoost > highestBoost ? volumeBoost : highestBoost
  const volume = Number(userBoost?.volume ?? 0)

  return isConnected ? (
    <div>
      <LeaderboardWarningBanner />
      <JoinProgramBanner />
      <div className="flex flex-col items-center md:flex-row md:items-start md:justify-between">
        <Rewards />
        <TotalPoints />
      </div>

      <div className="grid grid-cols-2 gap-x-2 gap-y-3 mt-8">
        <CurrentBoost
          className="col-span-full md:col-span-1"
          boost={currentBoost}
          volume={volume}
          boosts={userBoosts}
        />
        <Rank className="col-span-full md:col-span-1" />
        <NextLevel
          className="col-span-full"
          volume={volume}
          boost={userBoost?.boost}
        />
      </div>
      <Leaderboard />
    </div>
  ) : (
    <div>
      <ConnectWalletBanner />
    </div>
  )
}

function LeaderboardWarningBanner() {
  const [leaderboardWarning, setLeaderboardWarning] = useLocalStorage<
    boolean | null
  >("leaderboardWarning", null)

  if (leaderboardWarning) return null
  return (
    <aside
      className={cn(
        "w-full flex justify-between space-x-4 align-middle rounded-lg mt-2 px-3 py-2 bg-mango-300 mb-6",
      )}
    >
      <div className="flex align-middle items-center space-x-2">
        <div
          className={cn(
            "h-8 aspect-square rounded-lg flex items-center justify-center text-red-100 p-1 bg-mango-300",
          )}
        >
          <Settings className={"text-mango-100"} />
        </div>
        <div>
          <Caption>
            Please note:{" "}
            <i>
              The leaderboard is currently reaggregating data. <br />
              We appreciate your patience and understanding as our developers
              work diligently on these enhancements.
            </i>
          </Caption>
        </div>
      </div>
      <button
        className="top-3 right-2 hover:opacity-90 transition-opacity"
        onClick={() => setLeaderboardWarning(true)}
      >
        <X className="text-cloud-300 w-5 h-5 hover:text-secondary" />
        <span className="sr-only">Close</span>
      </button>
    </aside>
  )
}
