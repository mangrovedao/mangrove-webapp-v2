import type { Token } from "@mangrovedao/mangrove.js"
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
    formattedWithSymbol:
      data &&
      `${Number(data?.formatted).toFixed(
        token?.displayedDecimals ?? 4,
      )} ${data?.symbol}`,
    ...rest,
  }
}
