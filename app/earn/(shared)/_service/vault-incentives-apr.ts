import { VaultLPProgram } from "../_hooks/use-vaults-incentives"

/** Total supply of MGV tokens */
const MGV_TOTAL_SUPPLY = 1e9 // 1B MGV

/**
 * Calculates the Annual Percentage Rate (APR) for liquidity provider incentives
 * @param vault - Address of the vault contract
 * @param incentives - Optional incentive program details for the vault
 * @returns Calculated APR as a percentage, or 0 if no active incentives or on error
 */
export function calculateIncentiveAPR(
  incentives?: VaultLPProgram,
  fdv?: number,
  quoteAssetPrice?: number,
): number {
  try {
    if (!incentives || !fdv) return 0
    const currentTimestamp = Math.floor(Date.now() / 1000)

    // Get all active programs for this vault
    const activePrograms =
      incentives.startTimestamp <= currentTimestamp &&
      incentives.endTimestamp > currentTimestamp

    if (!activePrograms) {
      return 0
    }
    // Sum up daily rewards from all active programs

    // rewardRate * 365 * FDV / (MGV_total_supply * quote_asset_price)
    // if quote asset = USD => quote_asset_price = 1
    // if ETH => quote_asset_price = 3500

    // Calculate APR: (daily rewards * 365 * MGV FDV) / MGV total supply

    const totalDailyRewards = incentives.rewardRate
    const incentiveAPR =
      (totalDailyRewards * 365 * fdv) /
      (MGV_TOTAL_SUPPLY * (quoteAssetPrice || 0))

    return incentiveAPR * 100
  } catch (error) {
    console.error(error)
    return 0
  }
}
