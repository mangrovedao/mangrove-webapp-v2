import { TokenMetadata } from "@/app/swap/utils/tokens"
import { Token } from "@mangrovedao/mgv"

export const overrideSymbol = (token?: Token | TokenMetadata) => {
  if (!token?.address) return ""
  const overrides: { [key: string]: string } = {
    "0x3894085ef7ff0f0aedf52e2a2704928d1ec074f1": "USDC.n",
    "0xe15fc38f6d8c56af07bbcbe3baf5708a2bf42392": "USDC",
  }
  return overrides[token.address.toLowerCase()] || token.symbol
}
