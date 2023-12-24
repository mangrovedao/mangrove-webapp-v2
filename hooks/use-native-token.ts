import { useNetwork } from "wagmi"

import useMangrove from "@/providers/mangrove"
import { useQuery } from "@tanstack/react-query"

export function useNativeToken() {
  const { mangrove } = useMangrove()
  const { chain } = useNetwork()
  return useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: [
      "native-token",
      mangrove?.address,
      chain?.id,
      chain?.nativeCurrency.symbol,
    ],
    queryFn: () => {
      const symbol = chain?.nativeCurrency.symbol
      if (!(mangrove && symbol)) return null
      return mangrove.tokenFromSymbol(symbol)
    },
    enabled: !!(mangrove && chain),
  })
}
