import { useDefaultChain } from "@/hooks/use-default-chain"
import { arbitrum, base, blast, sei } from "viem/chains"

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
