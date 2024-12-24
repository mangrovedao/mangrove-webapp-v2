import { VaultLPProgram } from "../_hooks/use-vaults-incentives"

/** Default fully diluted valuation of MGV token in USD */
const DEFAULT_MGV_FDV = 1e8 // $100M
/** Total supply of MGV tokens */
const MGV_TOTAL_SUPPLY = 1e9 // 1B MGV

/**
 * Calculates the Annual Percentage Rate (APR) for liquidity provider incentives
 * @param vault - Address of the vault contract
 * @param incentives - Optional incentive program details for the vault
 * @returns Calculated APR as a percentage, or 0 if no active incentives or on error
 */
export function calculateIncentiveAPR(incentives?: VaultLPProgram): number {
  try {
    if (!incentives) return 0
    const currentTimestamp = Math.floor(Date.now() / 1000)

    // Get all active programs for this vault
    const activePrograms =
      incentives.startTimestamp <= currentTimestamp &&
      incentives.endTimestamp > currentTimestamp

    if (!activePrograms) {
      return 0
    }

    // Sum up daily rewards from all active programs
    const totalDailyRewards = incentives.rewardRate

    // Calculate APR: (daily rewards * 365 * MGV FDV) / MGV total supply
    const incentiveAPR =
      (totalDailyRewards * 365 * DEFAULT_MGV_FDV) / MGV_TOTAL_SUPPLY
    return incentiveAPR * 100
  } catch (error) {
    console.error(error)
    return 0
  }
}
