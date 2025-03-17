"use client"

import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { toast } from "sonner"

function toastError(error: unknown) {
  if (typeof error === "string") {
    toast.error(error)
  } else {
    toast.error("Something went wrong with the request.")
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 1000,
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
  queryCache: new QueryCache({
    onError: (_error, query) => {
      if (typeof query.meta?.error === "string") {
        toast.error(query.meta.error)
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (_error, _variables, _context, mutation) => {
      if (mutation.meta?.disableGenericError === true) return
      toastError(mutation.meta?.error)
    },
    onSuccess: (_data, _variables, _context, mutation) => {
      if (typeof mutation.meta?.success === "string") {
        toast.success(mutation.meta?.success)
      }
    },
  }),
})

export function ReactQueryProvider({ children }: React.PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools
        initialIsOpen={false}
        position="left"
        buttonPosition="bottom-left"
      />
    </QueryClientProvider>
  )
}
