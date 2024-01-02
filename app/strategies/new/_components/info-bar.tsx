"use client"

import { TokenPair } from "@/components/token-pair"
import { Badge } from "../../_components/badge"
import { useTokensFromQueryParams } from "../_hooks/use-tokens-from-query-params"

export function InfoBar() {
  const { baseToken, quoteToken } = useTokensFromQueryParams()

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
