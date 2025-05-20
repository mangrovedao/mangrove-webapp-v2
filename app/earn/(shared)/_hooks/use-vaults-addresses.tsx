import { useDefaultChain } from "@/hooks/use-default-chain"
import { arbitrum, base, blast, sei } from "viem/chains"
import {
  VAULTS_WHITELIST_ARBITRUM,
  VAULTS_WHITELIST_BASE,
  VAULTS_WHITELIST_SEI,
} from "./vault-list"

export function useVaultsWhitelist() {
  const { defaultChain } = useDefaultChain()

  switch (defaultChain.id) {
    case base.id:
      return VAULTS_WHITELIST_BASE
    case arbitrum.id:
      return VAULTS_WHITELIST_ARBITRUM
    case sei.id:
      return VAULTS_WHITELIST_SEI
    default:
      return VAULTS_WHITELIST_BASE
  }
}

export function useVaultMintHelper() {
  const { defaultChain } = useDefaultChain()

  switch (defaultChain.id) {
    case blast.id:
      return ""
    case arbitrum.id:
      return "0xC39b5Fb38a8AcBFFB51D876f0C0DA0325b5cD440"
    case base.id:
      return "0x2AE6F95F0AC61441D9eC9290000F81087567cDa1"
    case sei.id:
      return "0x1ae53888Ce926ca468C9574DD2cb885B005E0716"
    default:
      return "0xC39b5Fb38a8AcBFFB51D876f0C0DA0325b5cD440"
  }
}
