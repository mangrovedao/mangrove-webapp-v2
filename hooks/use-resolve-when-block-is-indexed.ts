import { useMutation } from "@tanstack/react-query"

import useIndexerSdk from "@/providers/mangrove-indexer"

export function useResolveWhenBlockIsIndexed() {
  const { indexerSdk } = useIndexerSdk()

  return useMutation({
    mutationFn: async ({ blockNumber }: { blockNumber?: number }) => {
      if (!(indexerSdk && blockNumber)) return
      return indexerSdk.resolveWhenBlockIsIndexed(blockNumber)
    },
    mutationKey: ["resolveWhenBlockIsIndexed"],
  })
}
