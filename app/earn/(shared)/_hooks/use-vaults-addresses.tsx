import { Address } from "viem"
import { arbitrum, baseSepolia, blast } from "viem/chains"
import { useAccount } from "wagmi"

export const VAULTS_WHITELIST_ARBITRUM = [
  {
    manager: "Redacted labs",
    address: "0x270cD0d6D6e078e968c24Ef7d0c2eB82f02b1446" as Address,
    strategyType: "Kandel",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo ed ut perspiciatis unde omnis iste natus error sit voluptatem perspiciatis ...",
    descriptionBonus: "More infos...",
  },
]

export const VAULTS_WHITELIST_BASE_SEPOLIA = [
  {
    manager: "Redacted labs",
    address: "0xae68E2f084bC5B72Dbb5Dc5bD75AF8879eDb5CBC" as Address,
    strategyType: "Kandel",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo ed ut perspiciatis unde omnis iste natus error sit voluptatem perspiciatis ...",
    descriptionBonus: "More infos...",
  },
]

export function useVaultsWhitelist() {
  const { chainId } = useAccount()
  switch (chainId) {
    case blast.id:
      return []
    case arbitrum.id:
      return VAULTS_WHITELIST_ARBITRUM
    case baseSepolia.id:
      return VAULTS_WHITELIST_BASE_SEPOLIA
    default:
      return VAULTS_WHITELIST_ARBITRUM
  }
}
