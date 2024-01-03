"use client"

import { DataTable } from "@/components/ui/data-table/data-table"
import { useWhitelistedMarketsInfos } from "@/hooks/use-whitelisted-markets-infos"
import useMangrove from "@/providers/mangrove"
import { useTable } from "./hooks/use-table"
import { parseFaucetTokens } from "./schema"

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
          symbol: quote.symbol,
          address: quote.address?.toLowerCase(),
        },
      ])

      const uniqueTokens = Array.from(
        new Set(tokens.map((token) => token.id)),
      ).map((id) => tokens.find((token) => token.id === id))

      return parseFaucetTokens(uniqueTokens)
    },
  })

  const table = useTable({
    data: tokensQuery?.data ?? [],
  })

  return (
    <DataTable
      table={table}
      isError={!!tokensQuery.error}
      isLoading={tokensQuery.isLoading || !mangrove}
    />
  )
}
