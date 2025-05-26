import type { Token } from "@mangrovedao/mgv"

import { useAccount, useBalance } from "wagmi"

export function useTokenBalance(token?: Token) {
  const { address } = useAccount()

  // For native tokens (zero address), don't pass the token parameter
  const isNativeToken =
    token?.address === "0x0000000000000000000000000000000000000000"

  const { data, ...rest } = useBalance({
    address,
    token: isNativeToken ? undefined : (token?.address as `0x${string}`),
  })

  return {
    balance: data?.value,
    formatted: data?.formatted,
    formattedAndFixed:
      data && Number(data?.formatted).toFixed(token?.displayDecimals ?? 6),
    formattedWithSymbol:
      data &&
      `${Number(data?.formatted).toFixed(
        token?.displayDecimals ?? 6,
      )} ${data?.symbol}`,
    ...rest,
  }
}
