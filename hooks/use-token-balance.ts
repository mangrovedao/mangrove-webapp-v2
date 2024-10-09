import type { Token } from "@mangrovedao/mgv"

import { useAccount, useBalance } from "wagmi"

export function useTokenBalance(token?: Token) {
  const { address } = useAccount()
  const { data, ...rest } = useBalance({
    address,
    token: token?.address as `0x`,
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
