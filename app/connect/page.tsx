"use client"

import { ClientOnly } from "@/components/client-only"
import { Button } from "@/components/ui/button"
import {
  useWeb3Modal,
  useWeb3ModalEvents,
  useWeb3ModalState,
  useWeb3ModalTheme,
} from "@web3modal/wagmi/react"

export default function Page() {
  // 4. Use modal hook
  const modal = useWeb3Modal()
  const state = useWeb3ModalState()
  const { themeMode, themeVariables, setThemeMode } = useWeb3ModalTheme()
  const events = useWeb3ModalEvents()

  return (
    <main className="w-full items-center flex flex-col">
      <ClientOnly>
        <w3m-button />
        <w3m-network-button />
        <w3m-connect-button />
        <w3m-account-button />
        <Button onClick={() => modal.open({ view: "Connect" })}>
          Connect Wallet
        </Button>
        <Button onClick={() => modal.open({ view: "Networks" })}>
          Choose Network
        </Button>
        <Button
          onClick={() => setThemeMode(themeMode === "dark" ? "light" : "dark")}
        >
          Toggle Theme Mode
        </Button>
        <pre>{JSON.stringify(state, null, 2)}</pre>
        <pre>{JSON.stringify({ themeMode, themeVariables }, null, 2)}</pre>
        <pre>{JSON.stringify(events, null, 2)}</pre>
      </ClientOnly>
    </main>
  )
}
