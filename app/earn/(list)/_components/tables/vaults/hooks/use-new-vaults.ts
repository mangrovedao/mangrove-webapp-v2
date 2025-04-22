import { useVaultsWhitelist } from "@/app/earn/(shared)/_hooks/use-vaults-addresses"
import { useChains } from "@/providers/chains"
import { useEffect, useState } from "react"
import { Address, Chain } from "viem"

const DEPRECATED_VAULTS: Address[] = [
  "0x8ec6a6BB89ccF694129077954587B25b6c712bc8",
  "0xC95a225fd311E911a610D8274593C19282012119",
  "0x365cBDdFc764600D4728006730dd055B18f518ce",
  "0xCC1beacCdA8024bA968D63e6db9f01A15D593C52",
]

export function useNewVaults() {
  const [vaults, setVaults] = useState<{ [key: string]: any }>({})
  const { chains } = useChains()
  const plainVaults = useVaultsWhitelist()

  useEffect(() => {
    const fetchVault = async (chain: Chain) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_INDEXER_URL}/vault/list/${chain.id}`,
      )
      const data = await response.json()

      console.log(plainVaults)
      // data.forEach((item: any) =>
      //   console.log(
      //     incentives.find(
      //       (i) => i.vault.toLowerCase() === item.address.toLowerCase(),
      //     ),
      //   ),
      // )

      setVaults((prevVaults) => {
        if (!data.length) return prevVaults
        return {
          ...prevVaults,
          [chain.id]: data.map((item: any) => ({
            ...item,
            isDeprecated: item.address.toLowerCase() in DEPRECATED_VAULTS,
          })),
        }
      })
    }
    chains?.forEach((chain) => fetchVault(chain))
  }, [chains])

  return {
    vaults,
    count: Object.values(vaults).reduce(
      (acc, curr) => acc + Object.keys(curr).length,
      0,
    ),
  }
}
