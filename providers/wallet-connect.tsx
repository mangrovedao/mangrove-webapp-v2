"use client"

import {
  RainbowKitProvider,
  darkTheme,
} from "@rainbow-me/rainbowkit"
import "@rainbow-me/rainbowkit/styles.css"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WagmiProvider } from "wagmi"

import { config } from "@/config/wagmi"
import { MangroveUiProvider } from "@mangroveui/trade"


// Create a query client for React Query
const queryClient = new QueryClient()

export function WalletConnectProvider({ children }: React.PropsWithChildren) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <MangroveUiProvider>
          <RainbowKitProvider theme={darkTheme()}>{children}</RainbowKitProvider>
        </MangroveUiProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
