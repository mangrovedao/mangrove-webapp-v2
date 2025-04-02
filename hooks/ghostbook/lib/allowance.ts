import { erc20Abi, type Address, type Client } from "viem"
import {
  readContract,
  simulateContract,
  waitForTransactionReceipt,
  writeContract,
} from "viem/actions"

/**
 * Checks the current allowance for a spender to spend tokens on behalf of the account.
 *
 * @param client - The viem client with an account to check allowance for
 * @param user - The user address to check allowance for
 * @param spender - The address to check allowance for
 * @param token - The ERC20 token address to check
 * @returns The current allowance amount
 * @throws Error if account not found
 */
export async function checkAllowance(
  client: Client,
  user: Address,
  spender: Address,
  token: Address,
) {
  if (!user) {
    throw new Error("Account not found")
  }

  const allowance = await readContract(client, {
    address: token,
    abi: erc20Abi,
    functionName: "allowance",
    args: [user, spender],
  })

  return allowance
}

/**
 * Approves a spender to spend tokens on behalf of the account.
 * This is required before executing trades or transfers that involve ERC20 tokens.
 *
 * @param client - The viem client with an account to approve for
 * @param spender - The address that will be approved to spend the tokens
 * @param token - The ERC20 token address to approve
 * @param amount - The amount of tokens to approve
 * @param onAllowanceNeeded - Optional callback that runs before increasing allowance
 * @returns The new allowance amount
 * @throws Error if approval transaction fails
 */
export async function approveAmount(
  client: Client,
  spender: Address,
  token: Address,
  amount: bigint,
) {
  if (!client.account) {
    throw new Error("No user address found")
  }

  const { request } = await simulateContract(client, {
    address: token,
    abi: erc20Abi,
    functionName: "approve",
    args: [spender, amount],
  })

  const hash = await writeContract(client, request as any)

  const receipt = await waitForTransactionReceipt(client, { hash })
  if (receipt.status === "success") {
    return amount
  } else {
    throw new Error(`Allowance tx: ${hash} failed`)
  }
}
