import type { Token } from "@mangrovedao/mgv"

import { useAccount, useBalance } from "wagmi"

export const formatPrice = (amount: string) => {
  const num = Number(amount)
  if (!isFinite(num)) return amount

  const absNum = Math.abs(num)
  const sigFigs = 4

  // Use toPrecision to get desired sig figs
  let precise = num.toPrecision(sigFigs)

  // If result is in scientific notation, convert to fixed-point if possible
  if (precise.includes("e")) {
    const exponent = Math.floor(Math.log10(absNum))
    const decimalPlaces = Math.max(0, sigFigs - exponent - 1)

    // Clamp toFixed range to avoid RangeError
    const safeDecimalPlaces = Math.min(100, decimalPlaces)

    const fixed = num.toFixed(safeDecimalPlaces)
    return fixed.replace(/(\.\d*?[1-9])0+$|\.0+$/, "$1") // Trim trailing zeros
  }

  return precise
}


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
    formattedAndFixed: formatPrice(data?.formatted ?? "0"),
    formattedWithSymbol:
      data &&
      `${Number(data?.formatted).toFixed(
        token?.displayDecimals ?? 6,
      )} ${data?.symbol}`,
    ...rest,
  }
}
