import { Address } from "viem"
import { arbitrum, baseSepolia, blast } from "viem/chains"
import { useAccount } from "wagmi"

export const VAULTS_WHITELIST = [
  {
    manager: "Redacted labs",
    address: "0x47aE3b288350fE88DDDa224b89Afe324ED9C7419" as Address,
    strategyType: "Kandel",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo ed ut perspiciatis unde omnis iste natus error sit voluptatem perspiciatis ...",
    descriptionBonus: "More infos...",
  },
  {
    manager: "New Redacted labs",
    address: "0xae68E2f084bC5B72Dbb5Dc5bD75AF8879eDb5CBC" as Address,
    strategyType: "Kandel",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo ed ut perspiciatis unde omnis iste natus error sit voluptatem perspiciatis ...",
    descriptionBonus: "More infos...",
  },
]

// 0xae68E2f084bC5B72Dbb5Dc5bD75AF8879eDb5CBC base sepolia
// 0x270cD0d6D6e078e968c24Ef7d0c2eB82f02b1446 arbitrum

export function useVaultsWhitelist() {
  const { chainId } = useAccount()
  switch (chainId) {
    case blast.id:
      return VAULTS_WHITELIST
    case arbitrum.id:
      return VAULTS_WHITELIST
    case baseSepolia.id:
      return VAULTS_WHITELIST
    default:
      return undefined
  }
}
