"use client"

import "@rainbow-me/rainbowkit/styles.css"

import {
  RainbowKitProvider,
  darkTheme,
  getDefaultConfig,
} from "@rainbow-me/rainbowkit"
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { toast } from "sonner"
import { blast, blastSepolia, polygonMumbai } from "viem/chains"
import { WagmiProvider, http } from "wagmi"

import { env } from "@/env.mjs"
import { getWhitelistedChainObjects } from "@/utils/chains"

function toastError(error: unknown) {
  if (typeof error === "string") {
    toast.error(error)
  } else {
    toast.error("Something went wrong with the request.")
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 1000,
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
  queryCache: new QueryCache({
    onError: (_error, query) => {
      if (typeof query.meta?.error === "string") {
        toast.error(query.meta.error)
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (_error, _variables, _context, mutation) => {
      if (mutation.meta?.disableGenericError === true) return
      toastError(mutation.meta?.error)
    },
    onSuccess: (_data, _variables, _context, mutation) => {
      if (typeof mutation.meta?.success === "string") {
        toast.success(mutation.meta?.success)
      }
    },
  }),
})

const projectId = env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID

export const config = getDefaultConfig({
  appName: "Mangrove dApp",
  projectId,
  // @ts-ignore
  chains: getWhitelistedChainObjects(),
  ssr: true,
  transports: {
    [polygonMumbai.id]: http(),
    [blastSepolia.id]: http(),
    [blast.id]: http(
      "https://mgv-rpc.brah.finance/7843537C-DF1B-4AA7-9775-093E445865C9/rpc",
      {
        onFetchRequest: (request) => {
          console.log("Request", request)
        },
      },
    ),
  },
})

export function WalletConnectProvider({ children }: React.PropsWithChildren) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>{children}</RainbowKitProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </WagmiProvider>
  )
}
