import { type Address } from "viem"
import { VaultLPProgram } from "../_hooks/use-vaults-incentives"

const DEFAULT_MGV_FDV = 1e8 // $100M
const MGV_TOTAL_SUPPLY = 1e9 // 1B MGV

export function calculateIncentiveAPR(
  vault: Address,
  incentives?: VaultLPProgram[],
  mgvFDV: number = DEFAULT_MGV_FDV,
): number {
  try {
    if (!incentives) return 0
    const currentTimestamp = Math.floor(Date.now() / 1000)

    // Get all active programs for this vault
    const activePrograms = incentives.filter(
      (program) =>
        program.vault.toLowerCase() === vault.toLowerCase() &&
        program.startTimestamp <= currentTimestamp &&
        program.endTimestamp > currentTimestamp,
    )

    if (activePrograms.length === 0) {
      return 0
    }
    // Sum up daily rewards from all active programs
    const totalDailyRewards = activePrograms.reduce(
      (sum, program) => sum + program.rewardRate,
      0,
    )

    // Calculate APR: (daily rewards * 365 * MGV FDV) / MGV total supply
    const incentiveAPR = (totalDailyRewards * 365 * mgvFDV) / MGV_TOTAL_SUPPLY
    return incentiveAPR
  } catch (error) {
    console.error(error)
    return 0
  }
}
