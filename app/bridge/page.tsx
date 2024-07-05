"use client"

import { Bridge } from "@synapsecns/widget"
import { useEthereumWallet } from "./_hooks/use-ethereum-wallet"

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
