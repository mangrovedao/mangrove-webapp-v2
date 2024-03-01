"use client"

import "@rainbow-me/rainbowkit/styles.css"

import {
  RainbowKitProvider,
  darkTheme,
  getDefaultConfig,
} from "@rainbow-me/rainbowkit"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WagmiProvider, http } from "wagmi"
import * as wagmiChains from "wagmi/chains"
import { defineChain } from "viem"

import { env } from "@/env.mjs"
import { getWhitelistedChainObjects } from "@/utils/chains"

const queryClient = new QueryClient()
const projectId = env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID

export const blast = /*#__PURE__*/ defineChain({
    id: 81457,
    name: 'Blast',
    iconUrl:
      "https://cdn.routescan.io/_next/image?url=https%3A%2F%2Fcms-cdn.avascan.com%2Fcms2%2Fblast.dead36673539.png&w=48&q=100",
    nativeCurrency: {
      decimals: 18,
      name: 'Ether',
      symbol: 'ETH',
    },
    rpcUrls: {
      default: { http: ['https://rpc.blast.io'] },
    },
    blockExplorers: {
      default: { name: 'Blastscan', url: 'https://blastscan.io' },
    },
    contracts: {
      multicall3: {
        address: '0xcA11bde05977b3631167028862bE2a173976CA11',
        blockCreated: 212929,
      },
    },
    sourceId: 1 // mainnet
  })

const config = getDefaultConfig({
  appName: "Mangrove dApp",
  projectId,
  chains:  [blast, ...getWhitelistedChainObjects()],
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
