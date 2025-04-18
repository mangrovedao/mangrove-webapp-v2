import {
  formatUnits,
  isAddressEqual,
  parseAbi,
  type Address,
  type PublicClient,
} from "viem"
import { arbitrum, base, baseSepolia } from "viem/chains"

import { getTokenByAddress } from "@/utils/tokens"
import {
  arbitrumMarkets,
  baseMarkets,
  baseSepoliaMarkets,
} from "@mangrovedao/mgv/addresses"
import { VaultLPProgram } from "../_hooks/use-vaults-incentives"
import { abi } from "./abi"
import { calculateIncentiveAPR } from "./vault-incentives-apr"

/**
 * ABI definition for vault contract interactions
 * Contains function signatures for fetching market data, balances and fund state
 */
const vaultABI = parseAbi([
  "function market() external view returns (address base, address quote, uint256 tickSpacing)",
  "function getUnderlyingBalances() external view returns (uint256 baseAmount, uint256 quoteAmount)",
  "function fundsState() external view returns (uint8 state)",
])

/**
 * Type definition for vault data returned from blockchain
 */
type VaultData = {
  base: Address
  quote: Address
  baseAmount: bigint
  quoteAmount: bigint
  fundsState: number
}

/**
 * Fetches basic vault data using multicall
 * @param client - Web3 client for blockchain interaction
 * @param vault - Address of the vault contract
 * @returns Object containing vault market data, balances and state
 * @throws Error if data fetching fails
 */
async function getVaultData(
  client: PublicClient,
  vault: Address,
): Promise<VaultData> {
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

    return {
      base,
      quote,
      baseAmount,
      quoteAmount,
      fundsState,
    }
  } catch (error) {
    console.error("Failed to fetch vault data:", error)
    throw new Error("Failed to fetch vault data")
  }
}

/**
 * Calculates the AAVE APR for assets in Arbitrum chain
 * @param client - Web3 client for blockchain interaction
 * @param base - Base token address
 * @param quote - Quote token address
 * @param baseAmount - Amount of base token
 * @param quoteAmount - Amount of quote token
 * @returns Calculated AAVE APR as a number, or 0 if calculation fails
 */
async function calculateAaveAPR(
  client: PublicClient,
  base: Address,
  quote: Address,
  baseAmount: bigint,
  quoteAmount: bigint,
): Promise<number> {
  try {
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

    if (!baseInfo || !quoteInfo) {
      throw new Error("Missing reserve data")
    }

    const baseAPRRaw = baseInfo.liquidityRate || 0n
    const quoteAPRRaw = quoteInfo.liquidityRate || 0n
    const baseDecimals = baseInfo.decimals || 18n
    const quoteDecimals = quoteInfo.decimals || 18n

    // Scale amounts to match decimals
    const maxDecimals =
      baseDecimals > quoteDecimals ? baseDecimals : quoteDecimals
    const baseScale = 10n ** BigInt(maxDecimals - baseDecimals)
    const quoteScale = 10n ** BigInt(maxDecimals - quoteDecimals)

    const scaledBaseAmount = baseAmount * baseScale
    const scaledQuoteAmount = quoteAmount * quoteScale

    // Calculate weighted average APR
    const aaveAPRRaw =
      (baseAPRRaw * scaledBaseAmount + quoteAPRRaw * scaledQuoteAmount) /
      (scaledBaseAmount + scaledQuoteAmount)

    return Number(formatUnits(aaveAPRRaw, 25))
  } catch (error) {
    console.error("Failed to calculate AAVE APR:", error)
    return 0
  }
}

/**
 * Calculates the total APR for a vault, including AAVE yields, trading fees, and incentives
 * @param client - Web3 client for blockchain interaction
 * @param vaioult - Address of the vault contract
 * @returns Total calculated APR as a number, or 0 if calculation fails
 */
export async function getVaultAPR(
  client: PublicClient,
  vault: Address,
  incentives?: VaultLPProgram,
  fdv?: number,
): Promise<{ totalAPR: number; incentivesApr: number }> {
  try {
    if (client.chain?.testnet) return { totalAPR: 0, incentivesApr: 0 }

    const { base, quote, baseAmount, quoteAmount, fundsState } =
      await getVaultData(client, vault)

    let totalAPR = 0

    // Add AAVE APR if funds are deposited
    if (fundsState > 0 && client.chain?.id === arbitrum.id) {
      const aaveAPR = await calculateAaveAPR(
        client,
        base,
        quote,
        baseAmount,
        quoteAmount,
      )
      totalAPR += aaveAPR
    }

    const quoteAssetPrice =
      getTokenByAddress(quote, getMarkets(client.chain?.id), [])?.symbol ===
      "WETH"
        ? await getWethPrice()
        : 1

    const incentivesApr = calculateIncentiveAPR(
      incentives,
      fdv,
      quoteAssetPrice,
    )

    // Add trading APR if vault is actively trading
    if (fundsState > 1) {
      // Add estimated vault fees APR
      totalAPR += 3
      totalAPR += incentivesApr
    }

    return { totalAPR, incentivesApr: 0 }
  } catch (error) {
    console.error("Failed to calculate vault APR:", error)
    return { totalAPR: 0, incentivesApr: 0 }
  }
}

const getMarkets = (chainId?: number) => {
  switch (chainId) {
    case arbitrum.id:
      return arbitrumMarkets
    case baseSepolia.id:
      return baseSepoliaMarkets
    case base.id:
      return baseMarkets
    default:
      return baseMarkets
  }
}

async function getWethPrice() {
  let wethPrice = 3500 // fallback price
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=weth&vs_currencies=usd",
    )
    const data = await response.json()
    if (data?.weth?.usd) {
      wethPrice = data.weth.usd
    }
  } catch (error) {
    console.error("Failed to fetch WETH price, using fallback:", error)
  }
  return wethPrice
}
