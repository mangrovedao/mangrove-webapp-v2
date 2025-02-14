declare global {
  interface Window {
    BinanceChain?: any
  }
}

import { BscConnector } from "@binance-chain/bsc-connector"
import type { Chain } from "viem"
import { createConnector } from "wagmi"

interface BscProvider {
  on: (event: string, handler: (args: any) => void) => void
  removeListener: (event: string, handler: (args: any) => void) => void
  request: (args: { method: string; params?: any[] }) => Promise<any>
}

type BscConnectorOptions = {
  chains?: Chain[]
}

export const binanceConnector = createConnector((config) => {
  let provider: BscProvider | undefined
  let bscConnector: BscConnector | undefined

  const getConnector = async () => {
    if (!bscConnector) {
      bscConnector = new BscConnector({
        supportedChainIds: config.chains?.map((chain) => chain.id) ?? [
          1, 56, 97,
        ],
      })
    }
    return bscConnector
  }

  return {
    id: "binanceWallet",
    name: "Binance Wallet",
    type: "binanceWallet",

    async setup(): Promise<BscProvider | undefined> {
      const connector = await getConnector()
      provider = (await connector.getProvider()) as BscProvider
      return provider
    },

    async connect() {
      const connector = await getConnector()
      await connector.activate()
      provider = (await connector.getProvider()) as BscProvider
      const account = (await connector.getAccount()) as string
      const chainId = (await connector.getChainId()) as number
      return { account, chain: { id: chainId }, provider }
    },

    async disconnect() {
      if (!bscConnector) return
      await bscConnector.deactivate()
      provider = undefined
    },

    async getAccounts() {
      if (!bscConnector) throw new Error("Connector not initialized")
      const account = (await bscConnector.getAccount()) as string | null
      return account ? [account] : []
    },

    async getChainId() {
      if (!bscConnector) throw new Error("Connector not initialized")
      return (await bscConnector.getChainId()) as number
    },

    async isAuthorized() {
      try {
        if (!bscConnector) throw new Error("Connector not initialized")
        const account = await bscConnector.getAccount()
        return !!account
      } catch {
        return false
      }
    },

    onAccountsChanged(accounts: string[]) {
      return { account: accounts[0] }
    },

    onChainChanged(chainId: string | number) {
      const id = Number(chainId)
      const unsupported = !config.chains?.some((chain) => chain.id === id)
      return { chain: { id, unsupported } }
    },

    onDisconnect() {
      provider = undefined
      return { account: undefined, chain: undefined }
    },

    async getProvider(): Promise<BscProvider | undefined> {
      if (!provider) {
        await this.setup()
      }
      return provider
    },
  }
})
