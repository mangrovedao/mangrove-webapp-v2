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

import { MAX_TICK, type MarketParams } from "@mangrovedao/mgv"
import { BS, getSemibooksOLKeys } from "@mangrovedao/mgv/lib"
import {
  encodeAbiParameters,
  encodeFunctionData,
  type Address,
  type Client,
} from "viem"
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
  univ3Module: Address
  /** Uniswap V3 pool fee tier */
  fee: number
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
    univ3Module,
    fee,
    onTrade,
  } = params

  // Get the appropriate market based on trade direction
  const { asksMarket, bidsMarket } = getSemibooksOLKeys(_market)
  const market = bs === BS.buy ? asksMarket : bidsMarket

  // Encode the Uniswap V3 module parameters
  const moduleData = encodeAbiParameters(
    [
      { type: "address", name: "router" },
      { type: "uint24", name: "fee" },
    ],
    [router, fee],
  )

  // Encode the complete trade function call
  const data = encodeFunctionData({
    abi: ghostbookAbi,
    functionName: "marketOrderByTick",
    args: [
      market,
      maxTick,
      sendAmount,
      {
        module: univ3Module,
        data: moduleData,
      },
    ],
  })

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
        module: univ3Module,
        data: moduleData,
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
