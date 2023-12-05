import { useAccount, useBalance } from "wagmi"

export function useTokenBalance(tokenAddress?: string) {
  const { address, isConnected } = useAccount()
  const { data, ...rest } = useBalance({
    address,
    token: tokenAddress as `0x`,
    watch: false,
  })

  return {
    balance: data?.value,
    formattedWithSymbol:
      data && `${Number(data?.formatted).toFixed(2)} ${data?.symbol}`,
    ...rest,
  }
}
