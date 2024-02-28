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

export function useDeploySmartRouter() {
  const { address } = useAccount()
  const { mangrove } = useMangrove()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()

  const orderContract = mangrove?.orderContract.address

  return useMutation({
    mutationFn: async () => {
      try {
        if (!publicClient || !address || !orderContract || !walletClient) return

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
          result: [proxy, deployed],
          request,
        } = await publicClient.simulateContract({
          address: ROUTER_FACTORY,
          abi: RouterProxyFactoryABI,
          functionName: "instantiate",
          args: [address, ROUTER_IMPLEMENTATION],
        })

        const tx = await walletClient?.writeContract(request)
        const res = await publicClient.waitForTransactionReceipt({
          hash: tx,
        })
        return res
      } catch (error) {
        console.error(error)
        throw new Error("Smart router deployment failed")
      }
    },
    meta: {
      error: "Smart router deployment failed",
      success: "Smart router deployed successfully",
    },
  })
}
