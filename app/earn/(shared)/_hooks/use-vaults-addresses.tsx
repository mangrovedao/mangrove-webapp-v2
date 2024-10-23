import { Address } from "viem"
import { arbitrum, baseSepolia, blast } from "viem/chains"
import { useAccount } from "wagmi"

export const VAULTS_WHITELIST = [
  {
    manager: "Redacted labs",
    address: "0x47aE3b288350fE88DDDa224b89Afe324ED9C7419" as Address,
    strategyType: "Kandel",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    descriptionBonus: "More infos...",
  },
]

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
