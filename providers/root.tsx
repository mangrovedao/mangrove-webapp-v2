import { DialogProvider } from "./dialogs"
import { FocusOutline } from "./focus-outline"
import { MangroveProvider } from "./mangrove"
import { CSPostHogProvider } from "./posthog"
import { StyledJsxRegistry } from "./style-jsx"
import { WalletConnectProvider } from "./wallet-connect"

export function RootProvider({ children }: React.PropsWithChildren) {
  return (
    <WalletConnectProvider>
      <DialogProvider>
        <MangroveProvider>
          <FocusOutline>
            <StyledJsxRegistry>
              <CSPostHogProvider>{children}</CSPostHogProvider>
            </StyledJsxRegistry>
          </FocusOutline>
        </MangroveProvider>
      </DialogProvider>
    </WalletConnectProvider>
  )
}
