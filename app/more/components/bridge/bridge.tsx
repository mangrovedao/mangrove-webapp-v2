"use client"

import { Bridge } from "@synapsecns/widget"

import { blast } from "viem/chains"
import { useEthersSigner } from "./_hooks/use-ethers-signer"
import WarningBanner from "./warning-banner"

export default function BridgeComponent() {
  const signer = useEthersSigner()

  if (!signer) {
    return <div>You need to connect your wallet</div>
  }

  return (
    <div>
      <div className="max-w-md m-auto">
        <Bridge
          web3Provider={signer.provider}
          customTheme={{
            "--synapse-text": "hsl(var(--text-primary))",
            "--synapse-secondary": "hsl(var(--text-secondary))",
            "--synapse-root": "hsl(var(--bg-secondary))",
            "--synapse-surface": "hsl(var(--bg-primary))",
            "--synapse-border": "transparent",
          }}
          targetChainIds={[blast.id]}
        />
      </div>
      <WarningBanner />
    </div>
  )
}
