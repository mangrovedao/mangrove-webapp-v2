import useMangrove from "@/providers/mangrove"
import { MangroveAmplifier } from "@mangrovedao/mangrove.js"
import { useQuery } from "@tanstack/react-query"
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

export function useSmartRouter() {
  const { address } = useAccount()
  const { mangrove } = useMangrove()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()

  const orderContract = mangrove?.orderContract.address

  return useQuery({
    queryKey: ["smart-router", orderContract, publicClient, address],
    queryFn: async () => {
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
          result: [proxy, isDeployed],
          request,
        } = await publicClient.simulateContract({
          address: ROUTER_FACTORY,
          abi: RouterProxyFactoryABI,
          functionName: "instantiate",
          args: [address, ROUTER_IMPLEMENTATION],
        })

        let isBound = false

        try {
          isBound = await publicClient.readContract({
            address: proxy,
            abi: SmartRouterABI,
            functionName: "isBound",
            args: [amplifier.address as Address],
          })
        } catch (error) {}

        return { isDeployed, isBound }
      } catch (error) {
        console.error(error)
        return { isDeployed: false, isBound: false }
      }
    },
    meta: {
      error:
        "Unable to verify amplified order smart-router deployment and activation.",
    },
    enabled: !!(
      address &&
      publicClient &&
      walletClient &&
      orderContract &&
      mangrove
    ),
    retry: false,
  })
}
