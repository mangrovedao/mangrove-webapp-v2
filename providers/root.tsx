import { Suspense } from "react"
import { ChainsProvider } from "./chains"
import { DialogProvider } from "./dialogs"
import { FocusOutline } from "./focus-outline"
import { MangroveProvider } from "./mangrove"
import { ReactQueryProvider } from "./react-query"
import { StyledJsxRegistry } from "./style-jsx"
import { WalletConnectProvider } from "./wallet-connect"

export function RootProvider({ children }: React.PropsWithChildren) {
  return (
    <Suspense>
      <WalletConnectProvider>
        <ReactQueryProvider>
          <DialogProvider>
            <MangroveProvider>
              <ChainsProvider>
                <FocusOutline>
                  <StyledJsxRegistry>
                    {/* <CSPostHogProvider> */}
                    {children}
                    {/* </CSPostHogProvider> */}
                  </StyledJsxRegistry>
                </FocusOutline>
              </ChainsProvider>
            </MangroveProvider>
          </DialogProvider>
        </ReactQueryProvider>
      </WalletConnectProvider>
    </Suspense>
  )
}
