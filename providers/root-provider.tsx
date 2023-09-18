import { MangroveProvider } from "./mangrove"
import { WalletConnectProvider } from "./wallet-connect"

export function RootProvider({ children }: React.PropsWithChildren) {
  return (
    <WalletConnectProvider>
      <MangroveProvider>{children}</MangroveProvider>
    </WalletConnectProvider>
  )
}
