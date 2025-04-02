import { Caption } from "@/components/typography/caption"
import { ImageWithHideOnError } from "@/components/ui/image-with-hide-on-error"
import { Skeleton } from "@/components/ui/skeleton"
import { ReactNode } from "react"
import { Address, Chain, parseAbi, PublicClient } from "viem"
import { pnlSchema, priceSchema } from "./schemas"

// ============= CONTRACT INTERFACES =============

/**
 * ABI definition for vault contract interactions
 * Contains function signatures for fetching vault data like balances, fees, etc.
 */
export const VaultABI = parseAbi([
  "function getUnderlyingBalances() public view returns (uint256 amount0Current, uint256 amount1Current)",
  "function totalSupply() public view returns (uint)",
  "function balanceOf(address account) public view returns (uint)",
  "function feeData() external view returns (uint16 performanceFee, uint16 managementFee, address feeRecipient)",
  "function market() external view returns (address base, address quote, uint256 tickSpacing)",
  "function getTotalInQuote() public view returns (uint256 quoteAmount, uint256 tick)",
  "function decimals() public view returns (uint8)",
  "function symbol() public view returns (string)",
  "function lastTotalInQuote() public view returns (uint256)",
  "function lastTimestamp() public view returns (uint256)",
])

// ============= HELPER FUNCTIONS =============

/**
 * Fetches token prices from the price API
 */
export async function fetchTokenPrices(
  client: PublicClient,
  market: [string, string, bigint],
): Promise<[number, number]> {
  try {
    const [base, quote] = market
    const [basePrice, quotePrice] = await Promise.all([
      fetch(
        `https://price.mgvinfra.com/price-by-address?chain=${client.chain?.id}&address=${base}`,
      )
        .then((res) => res.json())
        .then((data) => priceSchema.parse(data))
        .then((data) => data.price)
        .catch(() => 1),
      fetch(
        `https://price.mgvinfra.com/price-by-address?chain=${client.chain?.id}&address=${quote}`,
      )
        .then((res) => res.json())
        .then((data) => priceSchema.parse(data))
        .then((data) => data.price)
        .catch(() => 1),
    ])
    return [basePrice, quotePrice]
  } catch (error) {
    console.error(error)
    // Return default values on error
    return [1, 1]
  }
}

/**
 * Fetches PnL data for a specific user and vault
 */
export async function fetchPnLData(
  client: PublicClient,
  vaultAddress: Address,
  user?: Address,
) {
  try {
    if (!user) return undefined

    const res = await fetch(
      `https://indexer.mgvinfra.com/vault/pnl/${client.chain?.id}/${vaultAddress}/${user}`,
    )

    const data = await res.json()
    return pnlSchema.parse(data)
  } catch (error) {
    return undefined
  }
}

/**
 * Calculates fees and related metrics for a vault
 */
export function calculateFees(
  totalInQuote: bigint,
  lastTotalInQuote: bigint,
  lastTimestamp: bigint,
  performanceFee: number,
  managementFee: number,
  totalSupply: bigint,
) {
  const currentTimestamp = BigInt(Math.floor(Date.now() / 1000))
  const interest = totalInQuote - lastTotalInQuote

  // Performance fee calculation
  const performanceFeeAmount =
    interest > 0n ? (interest * BigInt(performanceFee)) / 100_000n : 0n

  // Management fee calculation
  const ONE_YEAR_IN_SECONDS = 60n * 60n * 24n * 365n
  const managementFeeAmount =
    (totalInQuote *
      BigInt(managementFee) *
      (currentTimestamp - lastTimestamp)) /
    (100_000n * ONE_YEAR_IN_SECONDS)

  const totalFee = performanceFeeAmount + managementFeeAmount
  const feeShares =
    totalInQuote <= 0n
      ? 0n
      : (totalFee * totalSupply) / (totalInQuote - totalFee)

  return {
    totalFee,
    feeShares,
    newTotalSupply: totalSupply + feeShares,
  }
}

export function getIconFromChainlist(name: string) {
  let icon = name

  if (icon.includes("Arbitrum One")) {
    icon = "arbitrum"
  }

  return `https://icons.llamao.fi/icons/chains/rsz_${icon.toLowerCase().replaceAll(" ", "_")}.jpg`
}

export function getChainImage(chain: Chain) {
  return (
    <ImageWithHideOnError
      src={`/assets/chains/${chain.id}.webp`}
      width={16}
      height={16}
      className="h-4 rounded-sm size-4"
      key={chain.id}
      alt={`${chain.name}-logo`}
    />
  )
}

export const Line = ({
  title,
  value,
}: {
  title: ReactNode
  value: ReactNode
}) => {
  return (
    <div className="flex justify-between mt-2 items-center">
      <Caption className="text-gray text-xs"> {title}</Caption>
      {value ? (
        <Caption className="text-gray !text-sm">{value}</Caption>
      ) : (
        <Skeleton className="h-4 w-full" />
      )}
    </div>
  )
}

export const LineRewards = ({
  title,
  value,
}: {
  title: ReactNode
  value: ReactNode
}) => {
  return (
    <div className="flex justify-between items-center flex-wrap">
      <Caption className="text-text-secondary !text-sm"> {title}</Caption>
      <Caption className="text-text-primary !text-sm">{value}</Caption>
    </div>
  )
}
