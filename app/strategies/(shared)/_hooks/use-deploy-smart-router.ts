

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

export function useDeploySmartRouter(kandelAddress: string) {
  const { address, chain } = useAccount()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()


  return useMutation({
    mutationFn: async () => {
      try {
        if (!publicClient || !address || !walletClient) return


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
