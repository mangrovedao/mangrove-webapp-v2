import {
  baseSepoliaLogics,
  baseSepoliaMangrove,
  baseSepoliaMarkets,
  baseSepoliaSmartKandel,
  baseSepoliaTokens,
  blastLogics,
  blastMangrove,
  blastMarkets,
  blastSmartKandel,
  blastTokens,
} from "@mangrovedao/mgv/addresses"
import { base, blast } from "viem/chains"
import { useChainId } from "wagmi"

export function useMangroveAddresses() {
  const chain = useChainId()
  switch (chain) {
    case blast.id:
      return blastMangrove
    case base.id:
      return baseSepoliaMangrove
    default:
      return undefined
  }
}

export function useSmartKandel() {
  const chain = useChainId()
  switch (chain) {
    case blast.id:
      return blastSmartKandel
    case base.id:
      return baseSepoliaSmartKandel
    default:
      return undefined
  }
}

export function useMarkets() {
  const chain = useChainId()
  switch (chain) {
    case blast.id:
      return blastMarkets
    case base.id:
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
    case base.id:
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
    case base.id:
      return baseSepoliaTokens
    default:
      return []
  }
}
