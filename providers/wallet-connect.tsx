"use client"

import "@rainbow-me/rainbowkit/styles.css"

import {
  Chain,
  RainbowKitProvider,
  darkTheme,
  getDefaultConfig,
} from "@rainbow-me/rainbowkit"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WagmiProvider, http } from "wagmi"
import * as wagmiChains from "wagmi/chains"

import { env } from "@/env.mjs"
import { getWhitelistedChainObjects } from "@/utils/chains"

const queryClient = new QueryClient()
const projectId = env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID

const blastMainnetRpcUrl = process.env.NEXT_PUBLIC_BLAST_MAINNET_RPC_URL ?? ""

const blastMainner = {
  id: 81457,
  name: "Blast",
  iconUrl:
    "https://cdn.routescan.io/_next/image?url=https%3A%2F%2Fcms-cdn.avascan.com%2Fcms2%2Fblast.dead36673539.png&w=48&q=100",
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [blastMainnetRpcUrl],
    },
  },
} as const satisfies Chain

const config = getDefaultConfig({
  appName: "Mangrove dApp",
  projectId,
  // @ts-ignore
  chains: blastMainnetRpcUrl
    ? [...getWhitelistedChainObjects(), blastMainner]
    : getWhitelistedChainObjects(),
  transports: {
    [wagmiChains.polygon.id]: http(),
    [wagmiChains.polygonMumbai.id]: http(),
    [wagmiChains.blastSepolia.id]: http(),
    [wagmiChains.arbitrum.id]: http(),
    [81457]: http(),
  },
  ssr: true,
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
