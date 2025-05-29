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
import { arbitrum, base, megaethTestnet, sei } from "wagmi/chains"

import { createFallbackTransport } from "@/config/fallback-transport"
import { env } from "@/env.mjs"

// Create a query client for React Query
const projectId = env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID

// Set up the wallets we want to support
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

// Configure wallet connectors
const connectors = connectorsForWallets(recommendedWalletList, {
  projectId: projectId,
  appName: "Mangrove dApp",
})

// Create wagmi config with fallback RPC for Base
export const config = createConfig({
  ssr: true,
  connectors,
  chains: [arbitrum, base, megaethTestnet, sei],
  transports: {
    [sei.id]: http(),
    [arbitrum.id]: http(),
    [megaethTestnet.id]: http(),
    [base.id]: createFallbackTransport(base, true),
  },
})
