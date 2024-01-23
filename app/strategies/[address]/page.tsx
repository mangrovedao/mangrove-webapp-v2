"use client"

import { TokenPair } from "@/components/token-pair"
import BackButton from "./_components/back-button"
import useKandel from "./_providers/kandel-strategy"

export default function Page() {
  const { strategyQuery, strategyAddress } = useKandel()
  return (
    <div className="border-b">
      <div className="max-w-5xl mx-auto space-y-8">
        <BackButton href={"/strategies"}>Back to Strategies</BackButton>

        <div className="flex justify-between items-center">
          <TokenPair />
        </div>
      </div>
    </div>
  )
}
