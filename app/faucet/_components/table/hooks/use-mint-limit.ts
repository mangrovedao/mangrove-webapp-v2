import { Address, formatUnits } from "viem"
import { useReadContract } from "wagmi"

import TestTokenAbi from "../../../_abis/test-token.json"

export function useMintLimit(tokenAddress: Address, mintable?: boolean) {
  const { data: decimals } = useReadContract<
    typeof TestTokenAbi,
    "decimals",
    readonly unknown[]
  >({
    address: tokenAddress,
    abi: TestTokenAbi,
    functionName: "decimals",
    query: {
      staleTime: 43200000,
      enabled: !!tokenAddress && !!mintable,
    },
  })

  return useReadContract<typeof TestTokenAbi, "mintLimit", readonly unknown[]>({
    address: tokenAddress,
    abi: TestTokenAbi,
    functionName: "mintLimit",
    query: {
      select(mintLimit) {
        if (!mintLimit || typeof mintLimit !== "bigint" || !decimals)
          return undefined
        return formatUnits(mintLimit, (decimals as number) ?? 0)
      },
      staleTime: 43200000,
      enabled: !!tokenAddress && !!decimals && mintable,
    },
  })
}
