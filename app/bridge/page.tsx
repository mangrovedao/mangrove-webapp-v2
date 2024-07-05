"use client"

import { Bridge, CustomRpcs } from "@synapsecns/widget"
import { useEthereumWallet } from "./_hooks/use-ethereum-wallet"

const customRpcs: CustomRpcs = {
  1: "https://eth.llamarpc.com",
  42161: "https://arbitrum.llamarpc.com",
}

export default function Page() {
  const { web3Provider } = useEthereumWallet()

  if (!web3Provider) {
    return null
  }

  return (
    <div className="max-w-md m-auto">
      <Bridge
        web3Provider={web3Provider}
        customTheme={{ bgColor: "hsl(180deg 86% 3%)" }}
      />
    </div>
  )
}
