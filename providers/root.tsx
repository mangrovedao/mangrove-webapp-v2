import { Suspense } from "react"
import { DialogProvider } from "./dialogs"
import { FocusOutline } from "./focus-outline"
import { MangroveProvider } from "./mangrove"
import { CSPostHogProvider } from "./posthog"
import { ReactQueryProvider } from "./react-query"
import { RedirectToBridge } from "./redirect-to-bridge"
import { StyledJsxRegistry } from "./style-jsx"
import { WalletConnectProvider } from "./wallet-connect"

export function RootProvider({ children }: React.PropsWithChildren) {
  return (
    <Suspense>
      <WalletConnectProvider>
        <ReactQueryProvider>
          <DialogProvider>
            <RedirectToBridge>
              <MangroveProvider>
                <FocusOutline>
                  <StyledJsxRegistry>
                    <CSPostHogProvider>{children}</CSPostHogProvider>
                  </StyledJsxRegistry>
                </FocusOutline>
              </MangroveProvider>
            </RedirectToBridge>
          </DialogProvider>
        </ReactQueryProvider>
      </WalletConnectProvider>
    </Suspense>
  )
}
