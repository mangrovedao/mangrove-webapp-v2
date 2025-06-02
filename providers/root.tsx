import { Suspense } from "react"
import { ChainsProvider } from "./chains"
import { DialogProvider } from "./dialogs"
import { FocusOutline } from "./focus-outline"
import { MangroveProvider } from "./mangrove"
import { ReactQueryProvider } from "./react-query"
import { StyledJsxRegistry } from "./style-jsx"
import { WalletConnectProvider } from "./wallet-connect"
import { MangroveUiProvider } from '@mangroveui/trade'

export function RootProvider({ children }: React.PropsWithChildren) {
  return (
    <Suspense>
      <WalletConnectProvider>
        <ReactQueryProvider>
          <DialogProvider>
            <MangroveUiProvider>
              <MangroveProvider>
                <ChainsProvider>
                  <FocusOutline>
                    <StyledJsxRegistry>{children}</StyledJsxRegistry>
                  </FocusOutline>
                </ChainsProvider>
              </MangroveProvider>
            </MangroveUiProvider>
          </DialogProvider>
        </ReactQueryProvider>
      </WalletConnectProvider>
    </Suspense>
  )
}
