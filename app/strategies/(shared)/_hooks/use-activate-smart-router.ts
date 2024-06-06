import useMangrove from "@/providers/mangrove"
import { useMutation } from "@tanstack/react-query"
import { Address, parseAbi } from "viem"
import { useAccount, usePublicClient, useWalletClient } from "wagmi"

const MangroveOrderABI = parseAbi([
  "function ROUTER_FACTORY() external view returns (address)",
  "function ROUTER_IMPLEMENTATION() external view returns (address)",
])

const RouterProxyFactoryABI = parseAbi([
  "function instantiate(address owner, address routerImplementation) public returns (address proxy, bool created)",
])

const SmartRouterABI = parseAbi([
  "function isBound(address mkr) public view returns (bool)",
  "function bind(address makerContract) public",
])

export function useActivateStrategySmartRouter(kandelAddress?: string) {
  const { address, chain } = useAccount()
  const { mangrove } = useMangrove()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  const orderContract = mangrove?.orderContract.address

  return useMutation({
    mutationFn: async () => {
      try {
        if (
          !publicClient ||
          !address ||
          !orderContract ||
          !walletClient ||
          !kandelAddress
        )
          throw new Error("Could not bind router, missing params")

        const ROUTER_FACTORY = await publicClient.readContract({
          address: orderContract as Address,
          abi: MangroveOrderABI,
          functionName: "ROUTER_FACTORY",
        })

        const ROUTER_IMPLEMENTATION = await publicClient.readContract({
          address: orderContract as Address,
          abi: MangroveOrderABI,
          functionName: "ROUTER_IMPLEMENTATION",
        })

        const {
          result: [proxy],
        } = await publicClient.simulateContract({
          address: ROUTER_FACTORY,
          abi: RouterProxyFactoryABI,
          functionName: "instantiate",
          args: [address, ROUTER_IMPLEMENTATION],
        })

        const tx = await walletClient?.writeContract({
          account: address,
          address: proxy,
          abi: SmartRouterABI,
          functionName: "bind",
          args: [kandelAddress as Address],
          chain: chain,
        })

        const result = await publicClient.waitForTransactionReceipt({
          hash: tx,
        })
        return result
      } catch (error) {
        console.error(error)
        throw new Error("Smart router activation failed.")
      }
    },
    meta: {
      error: "Smart router activation failed.",
      success: "Smart router activated successfully.",
    },
  })
}
