"use client"

import { Title } from "@/components/typography/title"
import { useMarkets } from "@/hooks/use-addresses"
import { getFeatureFlagConfig } from "@/schemas/feature-flag"
import { useRouter } from "next/navigation"
import React from "react"
import { Tables } from "./_components/tables/tables"

export default function Page() {
  const router = useRouter()
  const markets = useMarkets()
  const featureFlagConfig = getFeatureFlagConfig()
  const [hideCreateStrat, setHideCreateStrat] = React.useState(false)

  return (
    <main className=" md:pl-[160px] md:pr-[88px]">
      <div className="mt-[56px] flex justify-between items-center">
        <Title variant={"header1"} className="pl-4">
          Earn
        </Title>
      </div>
      <Tables hideCreateStrat={setHideCreateStrat} />
    </main>
  )
}
