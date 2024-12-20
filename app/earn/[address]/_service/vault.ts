import {
  formatUnits,
  isAddressEqual,
  parseAbi,
  type Address,
  type PublicClient,
} from "viem"
import { arbitrum } from "viem/chains"
import {
  ARBITRUM_INCENTIVE_PROGRAMS,
  BASE_SEPOLIA_INCENTIVE_PROGRAMS,
} from "../../(shared)/_hooks/use-vaults-incentives"
import { calculateIncentiveAPR } from "../../(shared)/_service/incentives"
import { abi } from "./abi"

export async function getVaultAPR(client: PublicClient, vault: Address) {
  const vaultABI = parseAbi([
    "function market() external view returns (address base, address quote, uint256 tickSpacing)",
    "function getUnderlyingBalances() external view returns (uint256 baseAmount, uint256 quoteAmount)",
    "function fundsState() external view returns (uint8 state)",
  ])

  try {
    const [[base, quote], [baseAmount, quoteAmount], fundsState] =
      await client.multicall({
        contracts: [
          { abi: vaultABI, address: vault, functionName: "market" },
          {
            abi: vaultABI,
            address: vault,
            functionName: "getUnderlyingBalances",
          },
          { abi: vaultABI, address: vault, functionName: "fundsState" },
        ],
        allowFailure: false,
      })

    let aaveAPR = 0
    if (client.chain?.id === arbitrum.id) {
      const provider = "0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb"
      const uicontract = "0xc0179321f0825c3e0F59Fe7Ca4E40557b97797a3"

      const [reservesData] = await client.multicall({
        contracts: [
          {
            abi,
            address: uicontract,
            functionName: "getReservesData",
            args: [provider],
          },
        ],
        allowFailure: false,
      })

      const baseInfo = reservesData[0]?.find((data) =>
        isAddressEqual(data.underlyingAsset as Address, base),
      )
      const quoteInfo = reservesData[0]?.find((data) =>
        isAddressEqual(data.underlyingAsset as Address, quote),
      )

      const baseAPRRaw = baseInfo?.liquidityRate || 0n
      const quoteAPRRaw = quoteInfo?.liquidityRate || 0n

      const baseDecimals = baseInfo?.decimals || 18n
      const quoteDecimals = quoteInfo?.decimals || 18n

      const maxDecimals =
        baseDecimals > quoteDecimals ? baseDecimals : quoteDecimals

      const baseScale = 10n ** BigInt(maxDecimals - baseDecimals)
      const quoteScale = 10n ** BigInt(maxDecimals - quoteDecimals)

      const aaveAPRRaw =
        (baseAPRRaw * baseScale * baseAmount +
          quoteAPRRaw * quoteScale * quoteAmount) /
        (baseScale * baseAmount + quoteScale * quoteAmount)

      aaveAPR = Number(formatUnits(aaveAPRRaw, 25))
    }

    let apr = 0

    if (fundsState > 0) apr += aaveAPR
    if (fundsState > 1) {
      const incentives =
        client.chain?.id === arbitrum.id
          ? ARBITRUM_INCENTIVE_PROGRAMS
          : BASE_SEPOLIA_INCENTIVE_PROGRAMS
      apr += 3 // estimated APR for the vault fees
      // Add MGV incentive APR if vault is active
      apr += calculateIncentiveAPR(vault, incentives)
    }

    return apr
  } catch (error) {
    // TODO: handle error
    return 0
  }
}
