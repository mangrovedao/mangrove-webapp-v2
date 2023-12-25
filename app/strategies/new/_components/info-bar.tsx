"use client"
import { redirect, useSearchParams } from "next/navigation"
import type { Address } from "viem"

import { TokenPair } from "@/components/token-pair"
import { useTokenFromId } from "@/hooks/use-token-from-id"
import { Badge } from "../../_components/badge"

export function InfoBar() {
  const searchParams = useSearchParams()
  const market = searchParams.get("market")
  const [baseId, quoteId] = market?.split(",") ?? []
  const { data: baseToken } = useTokenFromId(baseId as Address)
  const { data: quoteToken } = useTokenFromId(quoteId as Address)

  // redirect to /strategies if no market is selected
  if (!(market && baseId && quoteId)) return redirect("/strategies")
  return (
    <div className="border-b">
      <div className="py-6 px-4 max-w-8xl mx-auto">
        <span className="flex items-center space-x-4">
          <TokenPair
            baseToken={baseToken}
            quoteToken={quoteToken}
            tokenClasses="w-[28px] h-[28px]"
          />
          <Badge>Step 2/2</Badge>
        </span>
      </div>
    </div>
  )
}
