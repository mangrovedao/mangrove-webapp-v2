import { parseAbi, type Address, type PublicClient } from "viem"

const skateVaultABI = parseAbi([
  "function getMintAmounts(uint256 amount0Max,uint256 amount1Max) external view returns(uint256 amount0, uint256 amount1, uint256 mintAmount)",
])

type Args = {
  vault: Address
  amount0: bigint
  amount1: bigint
}

export async function getMintAmount(
  client: PublicClient,
  args: Args,
): Promise<{
  amount0: bigint
  amount1: bigint
  mintAmount: bigint
}> {
  const [amount0, amount1, mintAmount] = await client.readContract({
    address: args.vault,
    abi: skateVaultABI,
    functionName: "getMintAmounts",
    args: [args.amount0, args.amount1],
  })
  return { amount0, amount1, mintAmount }
}
