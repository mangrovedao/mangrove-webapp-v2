import { useTokens } from "@/hooks/use-addresses"
import { getIndexerUrl } from "@/utils/get-indexer-url"
import { useEffect, useState } from "react"
import { Address, Chain } from "viem"
import { useAccount } from "wagmi"

const DEPRECATED_VAULTS: Address[] = [
  "0x8ec6a6BB89ccF694129077954587B25b6c712bc8",
  "0xC95a225fd311E911a610D8274593C19282012119",
  "0x365cBDdFc764600D4728006730dd055B18f518ce",
  "0xCC1beacCdA8024bA968D63e6db9f01A15D593C52",
]

export function useVaults() {
  const [vaults, setVaults] = useState([])
  const { chain } = useAccount()
  const tokens = useTokens()
  const 

  const isDeprecated = (item: any) => {
    const fVaults = DEPRECATED_VAULTS.map((x) => x.toLowerCase())
    return fVaults.includes(item.vault.toLowerCase())
  }

  const findTokenBySymbol = (symbol: string) => {
    const token = tokens.find(
      (t) => t.symbol.toLowerCase() === symbol.toLowerCase(),
    )
    return token
  }

  useEffect(() => {
    const fetchVault = async (chain?: Chain) => {
      if (!chain) return

      const response = await fetch(
        `${getIndexerUrl(chain)}/vault/list/${chain.id}`,
      )
      const data = await response.json()

      setVaults((prevVaults) => {
        if (!data.length) return prevVaults
        return data.map((item: any) => ({
          ...item,
          strategyType: "Kandel Aave",
          manager: "Redacted Labs",
          address: item.vault,
          base: findTokenBySymbol(item.market.split("-")[0]),
          quote: findTokenBySymbol(item.market.split("-")[1]),
          isDeprecated: isDeprecated(item),
        }))
      })
    }
    fetchVault(chain)
  }, [chain])

  return {
    vaults,
    count: vaults.length,
  }
}
