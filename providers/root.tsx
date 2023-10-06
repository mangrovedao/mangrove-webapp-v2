import { MangroveProvider } from "./mangrove"
import { MetamaskProvider } from "./metamask-provider"
import { ReactQueryProvider } from "./react-query"

export function RootProvider({ children }: React.PropsWithChildren) {
  return (
    <MetamaskProvider>
      <ReactQueryProvider>
        <MangroveProvider>{children}</MangroveProvider>
      </ReactQueryProvider>
    </MetamaskProvider>
  )
}
