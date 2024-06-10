import useMangrove from "@/providers/mangrove"
import { MangroveAmplifier } from "@mangrovedao/mangrove.js"
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

export function useActivateSmartContract() {
  const { address, chain } = useAccount()
  const { mangrove } = useMangrove()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  const orderContract = mangrove?.orderContract.address

  return useMutation({
    mutationFn: async () => {
      try {
        if (!publicClient || !address || !orderContract || !walletClient) return
        const { amplifier } = new MangroveAmplifier({ mgv: mangrove })

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

        const tx = await walletClient?.writeContract({
          account: address,
          chain,
          address: proxy,
          abi: SmartRouterABI,
          functionName: "bind",
          args: [amplifier.address as Address],
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
