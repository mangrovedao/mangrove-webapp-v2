"use client"

import { useAccount } from "wagmi"
import { ConnectWalletBanner } from "./_components/connect-wallet-banner"
import CurrentBoost from "./_components/current-boost"
import { JoinProgramBanner } from "./_components/join-program-banner"
import { Leaderboard } from "./_components/leaderboard/table"
import NextLevel from "./_components/next-level"
import Rank from "./_components/rank"
import Rewards from "./_components/rewards"
import TotalPoints from "./_components/total-points"

export default function Page() {
  const { isConnected } = useAccount()
  return isConnected ? (
    <div>
      <JoinProgramBanner />
      <div className="flex flex-col items-center md:flex-row md:items-start md:justify-between">
        <Rewards />
        <TotalPoints />
      </div>

      <div className="grid grid-cols-2 gap-x-2 gap-y-3 mt-8">
        <CurrentBoost className="col-span-full md:col-span-1" />
        <Rank className="col-span-full md:col-span-1" />
        <NextLevel className="col-span-full" />
      </div>
      <Leaderboard />
    </div>
  ) : (
    <div>
      <ConnectWalletBanner />
    </div>
  )
}
