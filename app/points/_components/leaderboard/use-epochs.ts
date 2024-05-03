"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { env } from "@/env.mjs"
import { getErrorMessage } from "@/utils/errors"
import { parseEpochs } from "../../schemas/epochs"

export function useEpochs() {
  return useQuery({
    queryKey: ["epochs"],
    queryFn: async () => {
      try {
        const res = await fetch(
          `${env.NEXT_PUBLIC_MANGROVE_DATA_API_HOST}/epochs`,
        )
        const epochs = await res.json()
        return parseEpochs(epochs)
      } catch (e) {
        console.error(getErrorMessage(e))
        throw new Error()
      }
    },
    meta: {
      error: `Unable to retrieve epochs`,
    },
    retry: false,
    staleTime: 4 * 24 * 60 * 60 * 1000, // 4 days
    placeholderData: keepPreviousData,
  })
}
