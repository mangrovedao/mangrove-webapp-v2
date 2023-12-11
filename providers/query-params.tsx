"use client"

import NextAdapterApp from "next-query-params/app"
import { QueryParamProvider as Provider } from "use-query-params"

export function QueryParamProvider({ children }: React.PropsWithChildren) {
  return <Provider adapter={NextAdapterApp}>{children}</Provider>
}
