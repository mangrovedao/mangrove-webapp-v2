import { DialogProvider } from "./dialogs"
import { FocusOutline } from "./focus-outline"
import { MangroveProvider } from "./mangrove"
import { ReactQueryProvider } from "./react-query"
import { WalletConnectProvider } from "./wallet-connect"

export function RootProvider({ children }: React.PropsWithChildren) {
  return (
    <WalletConnectProvider>
      <ReactQueryProvider>
        <DialogProvider>
          <MangroveProvider>
            <FocusOutline>{children}</FocusOutline>
          </MangroveProvider>
        </DialogProvider>
      </ReactQueryProvider>
    </WalletConnectProvider>
  )
}
