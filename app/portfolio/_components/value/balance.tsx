"use client"

import InfoTooltip from "@/components/info-tooltip"
import { DataTable } from "@/components/ui/data-table/data-table"
import { useTable } from "../tables/balance/use-table"
import { useWhitelistedMarketsInfos } from "@/hooks/use-whitelisted-markets-infos"
import useMangrove from "@/providers/mangrove"
import { useState } from "react"

export default function Balance() {
  const { mangrove } = useMangrove()
  const [{ page, pageSize }, setPageDetails] = useState<PageDetails>({
    page: 1,
    pageSize: 10,
  })

  const {
    data: knownTokens,
    error,
    isLoading,
  } = useWhitelistedMarketsInfos(mangrove, {
    select: (whitelistedMarkets) => {
      const newData = whitelistedMarkets.flatMap(({ base, quote }) => [
        base.address?.toLowerCase(),
        quote.address?.toLowerCase(),
      ])
      return Array.from(new Set(newData)).map((address) => ({ address }))
    },
  })

  const table = useTable({
    data: knownTokens,
  })

  return (
    <div className="px-6 space-y-2">
      <div className="flex items-center">
        Balance
        <InfoTooltip className="pb-0.5">
          Balance of available assets (on Mangrove) in your wallet.
        </InfoTooltip>
      </div>
      <DataTable
        table={table}
        isError={!!error}
        isLoading={isLoading}
        pagination={{
          onPageChange: setPageDetails,
          page,
          pageSize,
          count: knownTokens?.length ?? 0,
        }}
      />
    </div>
  )
}
