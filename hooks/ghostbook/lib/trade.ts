/**
 * Core trading functionality for executing trades across Mangrove and Uniswap V3 DEXs.
 * Uses Ghostbook (Mangrove's order routing) to find and execute the best trades.
 *
 * The module provides:
 * - Type definitions for trade parameters
 * - Main trade execution function that handles:
 *   - Market order routing through Ghostbook
 *   - Integration with Uniswap V3 for additional liquidity
 *   - Transaction simulation and execution
 *   - Trade result callbacks
 */

import { ProtocolType } from "@/hooks/new_ghostbook/pool"
import { MAX_TICK, type MarketParams } from "@mangrovedao/mgv"
import { BS, getSemibooksOLKeys } from "@mangrovedao/mgv/lib"
import { encodeAbiParameters, type Address, type Client } from "viem"
import {
  simulateContract,
  waitForTransactionReceipt,
  writeContract,
} from "viem/actions"
import { ghostbookAbi } from "../abi/ghostbook"

/**
 * Parameters required to execute a trade
 */
export type TradeParams = {
  /** Viem client instance with account for executing trades */
  client: Client
  /** Ghostbook contract address for order routing */
  ghostbook: Address
  /** Market parameters including base/quote tokens */
  market: MarketParams
  /** Buy/Sell direction of the trade */
  bs: BS
  /** Amount of tokens to send in the trade */
  sendAmount: bigint
  /** Optional maximum tick price to accept */
  maxTick?: bigint
  /** Uniswap V3 router address */
  router: Address
  /** Uniswap V3 module address for Ghostbook */
  module: Address
  /** Uniswap V3 pool fee tier */
  fee: number
  /** Protocol type */
  protocol: ProtocolType
  /** Deadline for the trade */
  deadline: bigint
  /** Tick spacing for the trade */
  tickSpacing?: number
  /** Optional callback that runs after trade simulation but before execution */
  onTrade?: (expectedTradeResult: {
    got: bigint
    gave: bigint
    bounty: bigint
    feePaid: bigint
  }) => Promise<void>
}

/**
 * Executes a trade using Ghostbook's order routing
 *
 * The function will:
 * 1. Determine the correct market based on buy/sell direction
 * 2. Encode the trade parameters for Ghostbook
 * 3. Simulate the trade to check expected results
 * 4. Execute the trade if simulation succeeds
 * 5. Wait for and verify transaction receipt
 *
 * @param params Trade parameters including market, amounts, and callbacks
 * @throws Error if trade transaction fails
 */
export async function trade(params: TradeParams) {
  const {
    client,
    ghostbook,
    market: _market,
    bs,
    sendAmount,
    maxTick = MAX_TICK,
    router,
    module,
    fee,
    deadline,
    tickSpacing,
    protocol,
    onTrade,
  } = params

  // Get the appropriate market based on trade direction
  const { asksMarket, bidsMarket } = getSemibooksOLKeys(_market)
  const market = bs === BS.buy ? asksMarket : bidsMarket

  // Encode the Uniswap V3 module parameters
  const moduleDataV3 = encodeAbiParameters(
    [
      { type: "address", name: "router" },
      { type: "uint24", name: "fee" },
    ],
    [router, fee],
  )

  // encode for slipstream: (address router, uint24 fee, uint256 deadline, uint24 tickSpacing)
  const moduleDataSlipstream = encodeAbiParameters(
    [
      { type: "address", name: "router" },
      { type: "uint24", name: "fee" },
      { type: "uint256", name: "deadline" },
      { type: "uint24", name: "tickSpacing" },
    ],
    [router, fee, deadline, tickSpacing ?? 0], // note: should not be 0 for slipstream
  )

  // Simulate the trade to check expected results
  const { request, result } = await simulateContract(client, {
    address: ghostbook,
    abi: ghostbookAbi,
    functionName: "marketOrderByTick",
    args: [
      market,
      maxTick,
      sendAmount,
      {
        module,
        data:
          protocol === ProtocolType.Slipstream
            ? moduleDataSlipstream
            : moduleDataV3,
      },
    ],
  })

  // Destructure simulation results
  const [got, gave, bounty, feePaid] = result

  // Call optional callback with expected trade results
  await onTrade?.({ got, gave, bounty, feePaid })

  // Execute the actual trade
  const tx = await writeContract(client, request as any)

  // Wait for and verify transaction receipt
  const receipt = await waitForTransactionReceipt(client, { hash: tx })
  if (receipt.status === "success") {
    return { got, gave, bounty, feePaid, receipt }
  } else {
    throw new Error(`Trade tx: ${tx} failed`)
  }
}
