import { erc20Abi, type Address, type Client } from "viem"
import {
  readContract,
  simulateContract,
  waitForTransactionReceipt,
  writeContract,
} from "viem/actions"

/**
 * Checks and increases the allowance for a spender to spend tokens on behalf of the account.
 * This is required before executing trades or transfers that involve ERC20 tokens.
 *
 * The function will:
 * 1. Check the current allowance
 * 2. If allowance is insufficient, simulate and execute an approve transaction
 * 3. Wait for the approval transaction to be mined
 *
 * @param client - The viem client with an account to check/increase allowance for
 * @param spender - The address that will be approved to spend the tokens
 * @param token - The ERC20 token address to approve
 * @param amount - The amount of tokens to approve
 * @param onAllowanceNeeded - Optional callback that runs before increasing allowance
 * @returns The new allowance amount if increased, or existing allowance if sufficient
 * @throws Error if account not found or approval transaction fails
 */
export async function checkAndIncreaseAllowance(
  client: Client,
  user: Address,
  spender: Address,
  token: Address,
  amount: bigint,
  onAllowanceNeeded?: (allowance: bigint) => Promise<void>,
) {
  // Get the account address from the client
  const address = user
  if (!address) {
    throw new Error("Account not found")
  }

  // Check current allowance for the spender
  const allowance = await readContract(client, {
    address: token,
    abi: erc20Abi,
    functionName: "allowance",
    args: [address, spender],
  })

  // Only increase allowance if current allowance is insufficient
  if (allowance < amount) {
    // Call optional callback before increasing allowance
    await onAllowanceNeeded?.(amount)

    console.log(
      `Increasing allowance for token ${token} from ${allowance} to ${amount} for spender ${spender}`,
    )

    // Simulate the approve transaction first to check for potential errors
    const { request } = await simulateContract(client, {
      address: token,
      abi: erc20Abi,
      functionName: "approve",
      args: [spender, amount],
    })

    // Execute the actual approve transaction
    const hash = await writeContract(client, request as any)
    console.log(`Allowance tx: ${hash}`)

    // Wait for transaction to be mined and check status
    const receipt = await waitForTransactionReceipt(client, { hash })
    if (receipt.status === "success") {
      console.log(`Allowance tx: ${hash} success`)
    } else {
      throw new Error(`Allowance tx: ${hash} failed`)
    }
    return amount // Return new allowance amount
  }

  return allowance // Return existing allowance if sufficient
}
