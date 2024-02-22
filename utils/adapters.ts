import { Web3Provider } from "@ethersproject/providers"
import { WalletClient } from "viem"
import { useWalletClient } from "wagmi"

function walletClientToSigner(walletClient: WalletClient) {
  const { account, chain, transport } = walletClient ?? {}
  if (!account || !chain || !transport) return undefined
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain?.contracts?.ensRegistry?.address,
  }
  const provider = new Web3Provider(transport, network)
  return provider.getSigner(account.address)
}

/** Hook to convert a viem Wallet Client to an ethers.js Signer. */
export function useEthersSigner({ chainId }: { chainId?: number } = {}) {
  const { data: walletClient } = useWalletClient({ chainId })
  if (!walletClient) return undefined
  return walletClientToSigner(walletClient)
}
