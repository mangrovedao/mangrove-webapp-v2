"use client"

import CurrentBoost from "./_components/current-boost"
import NextLevel from "./_components/next-level"
import Points from "./_components/points"
import Rank from "./_components/rank"
import TotalPoints from "./_components/total-points"

export default function Page() {
  return (
    <div>
      <div className="flex flex-col items-center md:flex-row md:items-start md:justify-between">
        <Points />
        <TotalPoints />
      </div>

      <div className="grid grid-cols-2 gap-x-2 gap-y-3 mt-8">
        <CurrentBoost className="col-span-full md:col-span-1" />
        <Rank className="col-span-full md:col-span-1" />
        <NextLevel className="col-span-full" />
      </div>
    </div>
  )
}
