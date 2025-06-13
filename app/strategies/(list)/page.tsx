"use client"

import { useMarkets } from "@/hooks/use-addresses"
import { getFeatureFlagConfig } from "@/schemas/feature-flag"
import { redirect, useRouter } from "next/navigation"
import React from "react"

export default function Page() {
  const router = useRouter()
  const markets = useMarkets()
  const featureFlagConfig = getFeatureFlagConfig()
  const [hideCreateStrat, setHideCreateStrat] = React.useState(false)
  function handleNext() {
    if (!markets[0]) return
    router.push(
      `/strategies/new?market=${markets[0].base.address},${markets[0].quote.address},${markets[0].tickSpacing}`,
      {
        scroll: false,
      },
    )
  }

  return redirect("/trade")
}
