import { Address, Chain } from "viem"

export type UniClone = {
  /** SwapRouter contract address - handles execution of trades */
  router: Address
  /** Quoter contract address - provides price quotes and simulations */
  quoter: Address
  /** Factory contract address - deploys and tracks liquidity pools */
  factory: Address
  /** Human readable name of the DEX */
  name: string
  /** Chain the DEX is deployed on */
  chain: Chain
}
