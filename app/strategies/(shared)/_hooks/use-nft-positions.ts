import { useQuery } from "@tanstack/react-query"
import { Address, erc721Abi } from "viem"
import { useAccount, usePublicClient } from "wagmi"

type Props = { nftContract: string }

export function useNFTPositions({ nftContract }: Props) {
  const publicClient = usePublicClient()
  const { address: owner } = useAccount()

  return useQuery<(number | undefined)[] | undefined>({
    queryKey: ["nft-balance", publicClient?.account, owner],
    queryFn: async () => {
      try {
        if (!(publicClient && owner)) return
        console.log(1)
        const balance = await publicClient.readContract({
          address: owner,
          abi: erc721Abi,
          functionName: "balanceOf",
          args: [owner as Address],
        })
        console.log(2)

        const result = (
          await publicClient.multicall({
            contracts: Array(Number(balance) || 0).map((_, i) => ({
              address: nftContract as Address,
              abi: erc721Abi,
              functionName: "tokenOfOwnerByIndex",
              args: [owner, BigInt(i)],
            })),
          })
        ).map((v) => Number(v.result) || undefined)
        console.log(result)
        return result
      } catch (error) {
        console.error(error)
      }
    },
    enabled: !!(publicClient || owner),
  })
}
