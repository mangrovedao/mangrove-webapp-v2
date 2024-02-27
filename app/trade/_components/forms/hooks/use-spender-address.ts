import useMangrove from "@/providers/mangrove"
import { useQuery } from "@tanstack/react-query"

export const useSpenderAddress = (type: "limit" | "market" | "amplified") => {
  const { mangrove } = useMangrove()
  return useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ["spenderAddress", type, mangrove?.address],
    queryFn: async () => {
      if (!mangrove) return null
      if (type === "market") {
        return mangrove.address
      }
      return await mangrove.getRestingOrderRouterAddress()
    },
    enabled: !!mangrove,
  })
}
