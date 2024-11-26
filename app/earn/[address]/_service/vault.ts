import {
  formatUnits,
  isAddressEqual,
  parseAbi,
  type Address,
  type PublicClient,
} from "viem"
import { arbitrum } from "viem/chains"
import { abi } from "./abi"

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

export async function getVaultAPR(
  client: PublicClient,
  vault: Address,
  provider?: Address,
  uicontract?: Address,
) {
  const vaultABI = parseAbi([
    "function market() external view returns (address base, address quote, uint256 tickSpacing)",
    "function getUnderlyingBalances() external view returns (uint256 baseAmount, uint256 quoteAmount)",
    "function fundsState() external view returns (uint8 state)",
  ])

  try {
    if (client.chain?.id !== arbitrum.id) return 0

    const provider = "0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb" // IPoolAddressProvider from aave deployments
    const uicontract = "0xc0179321f0825c3e0F59Fe7Ca4E40557b97797a3" // UI contract from aave deployments

    const [
      [base, quote],
      [baseAmount, quoteAmount],
      fundsState,
      [reservesData],
    ] = await client.multicall({
      contracts: [
        { abi: vaultABI, address: vault, functionName: "market" },
        {
          abi: vaultABI,
          address: vault,
          functionName: "getUnderlyingBalances",
        },
        { abi: vaultABI, address: vault, functionName: "fundsState" },
        {
          abi,
          address: uicontract,
          functionName: "getReservesData",
          args: [provider],
        },
      ],
      allowFailure: false,
    })

    const baseInfo = reservesData.find(({ underlyingAsset }) =>
      isAddressEqual(underlyingAsset, base),
    )
    const quoteInfo = reservesData.find(({ underlyingAsset }) =>
      isAddressEqual(underlyingAsset, quote),
    )

    const baseAPRRaw = baseInfo?.liquidityRate || 0n
    const quoteAPRRaw = quoteInfo?.liquidityRate || 0n

    const baseDecimals = baseInfo?.decimals || 18n
    const quoteDecimals = quoteInfo?.decimals || 18n

    const maxDecimals =
      baseDecimals > quoteDecimals ? baseDecimals : quoteDecimals

    const baseScale = 10n ** (maxDecimals - baseDecimals)
    const quoteScale = 10n ** (maxDecimals - quoteDecimals)

    const aaveAPRRaw =
      (baseAPRRaw * baseScale * baseAmount +
        quoteAPRRaw * quoteScale * quoteAmount) /
      (baseScale * baseAmount + quoteScale * quoteAmount)

    // const baseAPR = Number(formatUnits(baseAPRRaw, 25));
    // const quoteAPR = Number(formatUnits(quoteAPRRaw, 25));
    const aaveAPR = Number(formatUnits(aaveAPRRaw, 25))

    let apr = 0

    if (fundsState > 0) apr += aaveAPR
    if (fundsState > 1) apr += 3 // estimated APR for the vault fees (TODO: add the incentive APR later)

    return apr
  } catch (error) {}
}
