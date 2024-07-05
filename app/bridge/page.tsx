"use client"

import { Bridge } from "@synapsecns/widget"
import { blast } from "viem/chains"
import { useEthersSigner } from "./_hooks/use-ethers-signer"

export default function Page() {
  const signer = useEthersSigner()

  if (!signer) {
    return null
  }

  return (
    <div className="max-w-md m-auto">
      <Bridge
        web3Provider={signer.provider}
        customTheme={{ bgColor: "hsl(180deg 86% 3%)" }}
        targetChainIds={[blast.id]}
      />
    </div>
  )
}
