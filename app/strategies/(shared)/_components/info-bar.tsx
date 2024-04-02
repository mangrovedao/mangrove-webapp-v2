"use client"
import Link from "next/link"

import InfoTooltip from "@/components/info-tooltip"
import { TokenPair } from "@/components/token-pair"
import { Text } from "@/components/typography/text"
import { useTokensFromQueryParams } from "../../[address]/edit/_hooks/use-tokens-from-query-params"

export function InfoBar() {
  const { baseToken, quoteToken } = useTokensFromQueryParams()

  return (
    <div className="border-b">
      <div className="py-6 px-4 max-w-8xl mx-auto">
        <span className="flex items-center space-x-2">
          <TokenPair
            baseToken={baseToken}
            quoteToken={quoteToken}
            tokenClasses="w-[28px] h-[28px]"
          />
          <InfoTooltip side="right">
            <Text>How to create a strategy</Text>
            <Link
              className="text-green-caribbean underline"
              href={
                "https://docs.mangrove.exchange/general/web-app/trade/how-to-make-an-order/amplify-order"
              }
              target="_blank"
              rel="noreferrer"
            >
              Learn more
            </Link>
          </InfoTooltip>
        </span>
      </div>
    </div>
  )
}
