import { Token } from "@mangrovedao/mangrove.js"
import { useQuery } from "@tanstack/react-query"
import { Address, ContractFunctionParameters, parseAbi } from "viem"
import { useAccount, usePublicClient } from "wagmi"
import { DefaultStrategyLogics } from "../type"

type Props = { logicId: string; v3Logics: DefaultStrategyLogics[] }

const positionManagerABI = parseAbi([
  "struct Position { uint96 nonce; address operator; address token0; address token1; uint24 fee; int24 tickLower; int24 tickUpper; uint128 liquidity; uint feeGrowthInside0LastX128; uint feeGrowthInside1LastX128; uint128 tokensOwed0; uint128 tokensOwed1; }",
  "function balanceOf(address owner) view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
  "function positions(uint256) view returns (Position)",
  "function factory() view returns (address)",
])

export function useNFTPositions({ logicId, v3Logics }: Props) {
  const publicClient = usePublicClient()
  const { address: owner } = useAccount()
  const isV3Logic = v3Logics.find((logic) => logic?.id === logicId)

  return useQuery<number[]>({
    queryKey: ["nft-balance", logicId, owner],
    queryFn: async () => {
      try {
        if (!publicClient || !owner || !isV3Logic) return []

        const logic = v3Logics?.find((item) => item?.id === logicId)
        const nftContract = await logic?.overlying({
          address: "0x",
        } as Token)

        const balance = await publicClient.readContract({
          address: nftContract as Address,
          abi: positionManagerABI,
          functionName: "balanceOf",
          args: [owner as Address],
        })

        if (Number(balance) <= 0) return []

        const result = (
          await publicClient.multicall({
            contracts: Array(Number(balance))
              .fill(1)
              .map(
                (_, i) =>
                  ({
                    address: nftContract as Address,
                    abi: positionManagerABI,
                    functionName: "tokenOfOwnerByIndex",
                    args: [owner, BigInt(i)],
                  }) as ContractFunctionParameters<
                    typeof positionManagerABI,
                    "view",
                    "tokenOfOwnerByIndex"
                  >,
              ),
            allowFailure: false,
          })
        ).map((item) => Number(item))

        return result || []
      } catch (error) {
        console.error(error)
        return []
      }
    },
    enabled: !!(publicClient || owner || isV3Logic),
  })
}
