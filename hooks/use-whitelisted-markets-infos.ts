import type Mangrove from "@mangrovedao/mangrove.js"
import { useQuery } from "@tanstack/react-query"
import { useNetwork } from "wagmi"

import { getWhitelistedMarketsInfos } from "@/services/markets.service"

type Params<T> = {
  select?: (data: Mangrove.OpenMarketInfo[]) => T
}

export function useWhitelistedMarketsInfos<T = Mangrove.OpenMarketInfo[]>(
  mangrove: Mangrove | null | undefined,
  { select }: Params<T> = {},
) {
  const { chain } = useNetwork()
  return useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ["whitelistedMarketsInfos", mangrove?.address, chain?.id],
    queryFn: async () => {
      if (!(mangrove && chain)) return []
      return getWhitelistedMarketsInfos(mangrove, chain.id)
    },
    meta: {
      error: "Unable to retrieve whitelisted markets",
    },
    enabled: !!(mangrove && chain),
    retry: false,
    select,
  })
}
