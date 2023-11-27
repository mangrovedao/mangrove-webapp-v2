"use client"

import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { toast } from "sonner"

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (_, query) => {
      if (typeof query.meta?.error === "string") {
        toast.error(query.meta.error)
      }
    },
  }),
})

export function ReactQueryProvider({ children }: React.PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
