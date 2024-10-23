"use client"

import { Bridge } from "@synapsecns/widget"

import { blast } from "viem/chains"
import WarningBanner from "./_components/warning-banner"
import { useEthersSigner } from "./_hooks/use-ethers-signer"

export default function Page() {
  const signer = useEthersSigner()

  if (!signer) {
    return null
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
