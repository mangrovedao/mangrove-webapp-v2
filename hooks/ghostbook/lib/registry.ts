import type { MangroveActionsDefaultParams } from "@mangrovedao/mgv"
import { arbitrumMangrove, baseMangrove } from "@mangrovedao/mgv/addresses"
import type { Address, Chain } from "viem"
import { arbitrum, base } from "viem/chains"

/**
 * Configuration type for Uniswap V3 and its clones/forks
 * Contains the core contract addresses needed to interact with the DEX
 */
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

/**
 * Registry of Uniswap V3 clones/forks and their contract addresses
 * Currently supports:
 * - Uniswap V3 on Arbitrum
 *
 * The registry is immutable (const) and type-checked to ensure all entries
 * match the UniClone interface
 */
export const uniClones = [
  // Uniswap V3 deployment on Arbitrum network
  {
    router: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
    quoter: "0x61fFE014bA17989E743c5F6cB21bF9697530B21e",
    factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
    name: "Uniswap V3",
    chain: arbitrum,
  },
  {
    router: "0x2626664c2603336E57B271c5C0b26F421741e481",
    quoter: "0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a",
    factory: "0x33128a8fC17869897dcE68Ed026d694621f6FDfD",
    name: "Uniswap V3",
    chain: base,
  },
] as const satisfies Array<UniClone>

export type MangroveChain = {
  ghostbook: Address
  univ3Module: Address
  mangroveParams: MangroveActionsDefaultParams
  chain: Chain
}

export const mangroveChains = {
  arbitrum: {
    ghostbook: "0xe2beB61E868661827Fa822A28080957e7136DcA9",
    univ3Module: "0x5126d161210654148445AdB3053e6DE2bbeaeefB",
    mangroveParams: arbitrumMangrove,
    chain: arbitrum,
  },
  base: {
    ghostbook: "0xBd7189C760a8D00933DCDd42ad565FebE9b5A918",
    univ3Module: "0x1cc93D6cf0706fD482F258B549C814D531d0B5BF",
    mangroveParams: baseMangrove,
    chain: base,
  },
} as const satisfies Record<string, MangroveChain>
