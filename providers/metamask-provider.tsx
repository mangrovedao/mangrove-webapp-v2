"use client"

import { MetaMaskProvider } from "@metamask/sdk-react"

export function MetamaskProvider({ children }: React.PropsWithChildren) {
  return (
    <MetaMaskProvider
      sdkOptions={{
        dappMetadata: {
          name: "Demo UI React App",
          url: window.location.host,
        },
        enableDebug: true,
      }}
    >
      {children}
    </MetaMaskProvider>
  )
}
