import { DialogProvider } from "./dialogs"
import { FocusOutline } from "./focus-outline"
import { MangroveProvider } from "./mangrove"
import { ReactQueryProvider } from "./react-query"
import { StyledJsxRegistry } from "./style-jsx"
import { WalletConnectProvider } from "./wallet-connect"

export function RootProvider({ children }: React.PropsWithChildren) {
  return (
    <WalletConnectProvider>
      <ReactQueryProvider>
        <DialogProvider>
          <MangroveProvider>
            <FocusOutline>
              <StyledJsxRegistry>{children}</StyledJsxRegistry>
            </FocusOutline>
          </MangroveProvider>
        </DialogProvider>
      </ReactQueryProvider>
    </WalletConnectProvider>
  )
}
