import {
  arbitrumMangrove,
  arbitrumMarkets,
  arbitrumTokens,
  baseSepoliaLogics,
  baseSepoliaMangrove,
  baseSepoliaMarkets,
  baseSepoliaTokens,
  blastLogics,
  blastMangrove,
  blastMarkets,
  blastTokens,
} from "@mangrovedao/mgv/addresses"
import { arbitrum, baseSepolia, blast } from "viem/chains"
import { useChainId } from "wagmi"

export function useMangroveAddresses() {
  const chain = useChainId()
  switch (chain) {
    case blast.id:
      return blastMangrove
    case arbitrum.id:
      return arbitrumMangrove
    case baseSepolia.id:
      return baseSepoliaMangrove
    default:
      return undefined
  }
}

export function useKandelSeeder() {
  const chain = useChainId()
  switch (chain) {
    case blast.id:
      return "0x4bb7567303c8bde27a4b490b3e5f1593c891b03d"
    case arbitrum.id:
      return "0x89139bed90b1bfb5501f27be6d6f9901ae35745d"
    case baseSepolia.id:
      return "0x1a839030107167452d69d8f1a673004b2a1b8a3a"
    default:
      return undefined
  }
}

export function useMarkets() {
  const chain = useChainId()
  switch (chain) {
    case blast.id:
      return blastMarkets
    case arbitrum.id:
      return arbitrumMarkets
    case baseSepolia.id:
      return baseSepoliaMarkets
    default:
      return []
  }
}

export function useLogics() {
  const chain = useChainId()
  switch (chain) {
    case blast.id:
      return blastLogics
    case arbitrum.id:
      return []
    case baseSepolia.id:
      return baseSepoliaLogics
    default:
      return []
  }
}

export function useTokens() {
  const chain = useChainId()
  switch (chain) {
    case blast.id:
      return blastTokens
    case arbitrum.id:
      return arbitrumTokens
    case baseSepolia.id:
      return baseSepoliaTokens
    default:
      return []
  }
}
