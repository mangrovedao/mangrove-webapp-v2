import { mangroveConfig } from "@/schemas/mangrove-config"

export type Cashness = Record<string, number>
export const STABLE_COIN_MIN_CASHNESS = 1000

export type RiskAppetite = "low" | "medium" | "high" | "-"

function getTokenCashness(tokenId: string) {
  return mangroveConfig?.tokens[tokenId]?.cashness
}

export const getRiskAppetite = (
  baseId: string,
  quoteId: string,
): RiskAppetite => {
  const baseCashness = getTokenCashness(baseId)
  const quoteCashness = getTokenCashness(quoteId)
  if (baseCashness === undefined || quoteCashness === undefined) {
    return "-"
  }
  const riskAppetite =
    (baseCashness >= STABLE_COIN_MIN_CASHNESS ? 2 : 1) *
    (quoteCashness >= STABLE_COIN_MIN_CASHNESS ? 2 : 1)

  return riskAppetite === 4 ? "low" : riskAppetite === 2 ? "medium" : "high"
}
