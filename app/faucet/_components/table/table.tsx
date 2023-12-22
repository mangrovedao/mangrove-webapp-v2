"use client"
import React from "react"

import { DataTable } from "@/components/ui/data-table/data-table"
import { useWhitelistedMarketsInfos } from "@/hooks/use-whitelisted-markets-infos"
import useMangrove from "@/providers/mangrove"
import { useTable } from "./hooks/use-table"
import { parseFaucetTokens, type FaucetToken } from "./schema"

export function FaucetTable() {
  const { mangrove } = useMangrove()
  const tokensQuery = useWhitelistedMarketsInfos(mangrove, {
    select: (whitelistedMarkets) => {
      const tokens = whitelistedMarkets.flatMap(({ base, quote }) => [
        {
          id: base.id,
          symbol: base.symbol,
          address: base.address?.toLowerCase(),
        },
        {
          id: quote.id,
          symbol: base.symbol,
          address: quote.address?.toLowerCase(),
        },
      ])

      const uniqueTokens = Array.from(
        new Set(tokens.map((token) => token.id)),
      ).map((id) => tokens.find((token) => token.id === id))

      return parseFaucetTokens(uniqueTokens)
    },
  })

  // selected token to mint
  const [, setTokenToMint] = React.useState<FaucetToken>()

  const table = useTable({
    data: tokensQuery?.data ?? [],
    onFaucet: setTokenToMint,
  })
  return (
    <DataTable
      table={table}
      isError={!!tokensQuery.error}
      isLoading={tokensQuery.isLoading || !mangrove}
    />
  )
}
