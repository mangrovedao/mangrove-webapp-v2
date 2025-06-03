import { useDefaultChain } from "@/hooks/use-default-chain"
import { type Address } from "viem"
import { arbitrum, base, baseSepolia, blast, sei } from "viem/chains"

/**
 * A program that distributes rewards to LP token holders.
 */
export type VaultLPProgram = {
  /** Address of the vault */
  vault: Address
  /** Start timestamp of the program */
  startTimestamp: number
  /** End timestamp of the program */
  endTimestamp: number
  /** Reward rate per day per LP token */
  rewardRate: number
  /** Maximum rewards that can be distributed in the program */
  maxRewards: number
}

export const ARBITRUM_INCENTIVE_PROGRAMS: VaultLPProgram[] = [
  {
    vault: "0x17086132Af8d39586c25FF8eA0B0283652108402", // arb-usdc
    startTimestamp: 1734908400, // 23rd dec 2024
    endTimestamp: 1737586800, // 23rd jan 2025
    maxRewards: 600_000,
    rewardRate: 0.01,
  },
  {
    vault: "0x533fcD483a7793bfC6f1D1Fe0f25158Cc60e0cC1", // WETH-USDC
    startTimestamp: 1734908400, // 23rd dec 2024
    endTimestamp: 1737586800, // 23rd jan 2025
    maxRewards: 600_000,
    rewardRate: 0.01,
  },
  {
    vault: "0xD97278e50aFd813C697526AaEAeC5022393d4B7B", // WBTC-USDT
    startTimestamp: 1734908400, // 23rd dec 2024
    endTimestamp: 1737586800, // 23rd jan 2025
    maxRewards: 600_000,
    rewardRate: 0.01,
  },
  {
    vault: "0x17008340AC68B11E883FC0fd7f82a6106419b12a", // weETH-WETH
    startTimestamp: 1734908400, // 23rd dec 2024
    endTimestamp: 1737586800, // 23rd jan 2025
    maxRewards: 600_000,
    rewardRate: 35,
  },
  {
    vault: "0xa99C55E911c028d610e709603CCCA2Df7a22C19D", // USDC-USDT
    startTimestamp: 1734908400, // 23rd dec 2024
    endTimestamp: 1737586800, // 23rd jan 2025
    maxRewards: 600_000,
    rewardRate: 0.01,
  },
]

export const BASE_SEPOLIA_INCENTIVE_PROGRAMS: VaultLPProgram[] = [
  {
    vault: "0xae68E2f084bC5B72Dbb5Dc5bD75AF8879eDb5CBC", // wbtc-dai
    startTimestamp: 1734540665, // 18th dec 2024
    endTimestamp: 1737586800, // 23rd jan 2025
    maxRewards: 1e9, // 1 billion MGV
    rewardRate: 0.01,
  },
]

export const BASE_VAULT_INCENTIVE_PROGRAMS: VaultLPProgram[] = [
  {
    vault: "0xCC1beacCdA8024bA968D63e6db9f01A15D593C52", // weth-usdc
    startTimestamp: 1743976800, // 7th april 2025
    endTimestamp: 1746568800, // 7th may 2025
    maxRewards: 600_000,
    rewardRate: 0.01,
  },
  {
    vault: "0x365cBDdFc764600D4728006730dd055B18f518ce", // cbbtc-USDC
    startTimestamp: 1743976800, // 7th april 2025
    endTimestamp: 1746568800, // 7th may 2025
    maxRewards: 600_000,
    rewardRate: 0.01,
  },
  {
    vault: "0xC95a225fd311E911a610D8274593C19282012119", // cbbtc-EURC
    startTimestamp: 1743976800, // 7th april 2025
    endTimestamp: 1746568800, // 7th may 2025
    maxRewards: 600_000,
    rewardRate: 0.01,
  },
  {
    vault: "0xa82cbD1D7826614D1E487541F40ce5A43e58999D", // cbbtc-WETH
    startTimestamp: 1743976800, // 7th april 2025
    endTimestamp: 1746568800, // 7th may 2025
    maxRewards: 600_000,
    rewardRate: 20,
  },
  {
    vault: "0x8ec6a6BB89ccF694129077954587B25b6c712bc8", // wstETH-WETH
    startTimestamp: 1743976800, // 7th april 2025
    endTimestamp: 1746568800, // 7th may 2025
    maxRewards: 600_000,
    rewardRate: 20,
  },
]

export function useVaultsIncentives() {
  const { defaultChain } = useDefaultChain()

  switch (defaultChain.id) {
    case blast.id:
      return []
    case arbitrum.id:
      return ARBITRUM_INCENTIVE_PROGRAMS
    case baseSepolia.id:
      return BASE_SEPOLIA_INCENTIVE_PROGRAMS
    case base.id:
      return BASE_VAULT_INCENTIVE_PROGRAMS
    case sei.id:
      return []
    default:
      return ARBITRUM_INCENTIVE_PROGRAMS
  }
}
