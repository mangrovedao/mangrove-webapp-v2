import { FocusOutline } from "./focus-outline"
import { MangroveProvider } from "./mangrove"
import { ReactQueryProvider } from "./react-query"
import { WalletConnectProvider } from "./wallet-connect"

export function RootProvider({ children }: React.PropsWithChildren) {
  return (
    <WalletConnectProvider>
      <ReactQueryProvider>
        <MangroveProvider>
          <FocusOutline>{children}</FocusOutline>
        </MangroveProvider>
      </ReactQueryProvider>
    </WalletConnectProvider>
  )
}
