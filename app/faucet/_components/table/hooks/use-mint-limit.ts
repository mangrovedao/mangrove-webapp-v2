import { formatUnits } from "viem"
import { useContractRead, type Address } from "wagmi"

import TestTokenAbi from "../../../_abis/test-token.json"

export function useMintLimit(tokenAddress: Address, mintable?: boolean) {
  const { data: decimals } = useContractRead<
    typeof TestTokenAbi,
    "decimals",
    number | undefined
  >({
    address: tokenAddress,
    abi: TestTokenAbi,
    functionName: "decimals",
    cacheTime: 43200000, // 12 hours
    enabled: !!tokenAddress && !!mintable,
  })

  return useContractRead<typeof TestTokenAbi, "mintLimit", string | undefined>({
    address: tokenAddress,
    abi: TestTokenAbi,
    functionName: "mintLimit",
    cacheTime: 43200000, // 12 hours
    enabled: !!tokenAddress && !!decimals && mintable,
    select: (mintLimit) => {
      if (!mintLimit || typeof mintLimit !== "bigint" || !decimals)
        return undefined
      return formatUnits(mintLimit, decimals ?? 0)
    },
  })
}
