"use client"

import {
  RainbowKitProvider,
  WalletList,
  connectorsForWallets,
  darkTheme,
} from "@rainbow-me/rainbowkit"
import "@rainbow-me/rainbowkit/styles.css"
import {
  binanceWallet,
  coinbaseWallet,
  injectedWallet,
  ledgerWallet,
  magicEdenWallet,
  metaMaskWallet,
  mewWallet,
  nestWallet,
  oktoWallet,
  okxWallet,
  oneKeyWallet,
  rabbyWallet,
  rainbowWallet,
  trustWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WagmiProvider, createConfig, http } from "wagmi"
import { arbitrum, base, baseSepolia } from "wagmi/chains"

import { env } from "@/env.mjs"

const queryClient = new QueryClient()
const projectId = env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID

const recommendedWalletList: WalletList = [
  {
    groupName: "Popular",
    wallets: [
      injectedWallet,
      binanceWallet,
      coinbaseWallet,
      walletConnectWallet,
    ],
  },
  {
    groupName: "More",
    wallets: [
      rabbyWallet,
      metaMaskWallet,
      trustWallet,
      ledgerWallet,
      okxWallet,
      rainbowWallet,
      magicEdenWallet,
      mewWallet,
      nestWallet,
      oktoWallet,
      oneKeyWallet,
    ],
  },
]
const connectors = connectorsForWallets(recommendedWalletList, {
  projectId: projectId,
  appName: "Mangrove dApp",
})

export const config = createConfig({
  ssr: true,
  connectors,
  chains: [baseSepolia, arbitrum, base],
  transports: {
    [baseSepolia.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
  },
})

export function WalletConnectProvider({ children }: React.PropsWithChildren) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
