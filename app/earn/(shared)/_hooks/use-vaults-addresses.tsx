import { arbitrum, base, baseSepolia, blast } from "viem/chains"
import { useAccount } from "wagmi"
import {
  VAULTS_WHITELIST_ARBITRUM,
  VAULTS_WHITELIST_BASE_SEPOLIA,
} from "./vault-list"

export function useVaultsWhitelist() {
  const { chainId } = useAccount()
  switch (chainId) {
    case blast.id:
      return []
    case base.id:
      return []
    case arbitrum.id:
      return VAULTS_WHITELIST_ARBITRUM
    case baseSepolia.id:
      return VAULTS_WHITELIST_BASE_SEPOLIA
    default:
      return VAULTS_WHITELIST_ARBITRUM
  }
}

export function useVaultMintHelper() {
  const { chainId } = useAccount()
  switch (chainId) {
    case blast.id:
      return ""
    case arbitrum.id:
      return "0xC39b5Fb38a8AcBFFB51D876f0C0DA0325b5cD440"
    case base.id:
      return ""
    case baseSepolia.id:
      return "0xC0Ba6baF6899686bB601effE73bFC42404B93670"
    default:
      return "0xC39b5Fb38a8AcBFFB51D876f0C0DA0325b5cD440"
  }
}
