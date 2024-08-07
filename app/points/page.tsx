"use client"

import { useAccount } from "wagmi"

import { Caption } from "@/components/typography/caption"
import { cn } from "@/utils"
import { Settings, X } from "lucide-react"
import { useLocalStorage } from "usehooks-ts"
import { ConnectWalletBanner } from "./_components/connect-wallet-banner"
import CurrentBoost from "./_components/current-boost"
import { Leaderboard } from "./_components/leaderboard/table"
import { useUserVolume } from "./_components/leaderboard/use-leaderboard"
import NextLevel from "./_components/next-level"
import Rank from "./_components/rank"
import Rewards from "./_components/rewards"
import TotalPoints from "./_components/total-points"

const boosts = [
  { threshold: 500_000, boost: 4 },
  { threshold: 100_000, boost: 3.5 },
  { threshold: 50_000, boost: 3 },
  { threshold: 20_000, boost: 2.5 },
  { threshold: 10_000, boost: 1.75 },
  { threshold: 0, boost: 1 },
] as const

export default function Page() {
  const { isConnected } = useAccount()
  const { data: volume } = useUserVolume()
  const userVolume = Number(volume ?? 0)
  const volumeBoost = boosts.find((b) => userVolume >= b.threshold)?.boost ?? 1

  return isConnected ? (
    <div>
      <div className="flex flex-col items-center md:flex-row md:items-start md:justify-between">
        <Rewards />
        <TotalPoints />
      </div>

      <div className="grid grid-cols-2 gap-x-2 gap-y-3 mt-8">
        <CurrentBoost
          className="col-span-full md:col-span-1"
          boost={volumeBoost}
          volume={userVolume}
        />
        <Rank className="col-span-full md:col-span-1" />
        <NextLevel className="col-span-full" volume={userVolume} />
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
