import useMangrove from "@/providers/mangrove"
import { useQuery } from "@tanstack/react-query"

export const useSpenderAddress = (type: "limit" | "market") => {
  const { mangrove } = useMangrove()
  return useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ["spenderAddress", type, mangrove?.address],
    queryFn: async () => {
      if (!mangrove) return null
      if (type === "limit") {
        return await mangrove.getRestingOrderRouterAddress()
      }
      return mangrove.address
    },
    enabled: !!mangrove,
  })
}
