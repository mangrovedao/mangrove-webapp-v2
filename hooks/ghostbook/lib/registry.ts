import type { MangroveActionsDefaultParams } from "@mangrovedao/mgv"
import {
  arbitrumMangrove,
  baseMangrove,
  seiMangrove,
} from "@mangrovedao/mgv/addresses"
import type { Address, Chain } from "viem"
import { arbitrum, base, sei } from "viem/chains"

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
    pool: "0xC6962004f452bE9203591991D15f6b388e09E8D0",
    router: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
    quoter: "0x61fFE014bA17989E743c5F6cB21bF9697530B21e",
    factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
    name: "Uniswap V3",
    chain: arbitrum,
  },
  {
    pool: "0xd0b53D9277642d899DF5C87A3966A349A798F224",
    router: "0x2626664c2603336E57B271c5C0b26F421741e481",
    quoter: "0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a",
    factory: "0x33128a8fC17869897dcE68Ed026d694621f6FDfD",
    name: "Uniswap V3",
    chain: base,
  },
  {
    pool: "0x0000000000000000000000000000000000000000",
    router: "0x0000000000000000000000000000000000000000",
    quoter: "0x0000000000000000000000000000000000000000",
    factory: "0x0000000000000000000000000000000000000000",
    name: "Uniswap V3",
    chain: sei,
  },
] as const satisfies Array<UniClone & { pool: Address }>

export type MangroveChain = {
  ghostbook: Address
  univ3Module: Address
  mangroveParams: MangroveActionsDefaultParams
  chain: Chain
  balancerV2Module?: Address
}

export const mangroveChains = [
  {
    ghostbook: "0x46708Dd6E68e1f09c6f4830C2586f73659dFafEA",
    univ3Module: "0x22Ba67Eb361Ec40e0949ED034F3CE08Af51099fA",
    mangroveParams: arbitrumMangrove,
    balancerV2Module: "0x0000000000000000000000000000000000000000",
    chain: arbitrum,
  },
  {
    ghostbook: "0x15F02Fb9c9Bb772A3303349F88c94Fc971bd549F",
    univ3Module: "0xAf31bEb21d2b1f8C3BdD211eC02470265A21ea3f",
    balancerV2Module: "0x0000000000000000000000000000000000000000",
    mangroveParams: baseMangrove,
    chain: base,
  },
  {
    ghostbook: "0x127A5a5E086DCe304875e392C8170B04bC81e8B6",
    univ3Module: "0x4bB7F3087664E559365C4C94d3C21a39847d7726",
    balancerV2Module: "0x369022670f2C623Ee6894Ae4053eF54C2c685Dd0",
    mangroveParams: seiMangrove,
    chain: sei,
  },
] as const satisfies Array<MangroveChain>
