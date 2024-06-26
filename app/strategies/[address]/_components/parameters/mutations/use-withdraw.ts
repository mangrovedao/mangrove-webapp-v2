import useKandelInstance from "@/app/strategies/(shared)/_hooks/use-kandel-instance"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export function useWithDraw({
  kandelInstance,

  volumes,
}: {
  kandelInstance?: ReturnType<typeof useKandelInstance>
  volumes: { baseAmount: string; quoteAmount: string }
}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      try {
        if (!kandelInstance) {
          throw new Error("Strategy Instance could not be fetched")
        }

        const { baseAmount, quoteAmount } = volumes

        // const res = await (
        //   await kandelInstance.withdraw({
        //     baseAmount,
        //     quoteAmount,
        //   })
        // ).wait()

        toast.success("Withdraw completed")
        // return res.blockNumber
      } catch (err) {
        console.error(err)
        toast.error("Failed to withdraw")
        throw new Error("Failed to withdraw")
      }
    },
    meta: {
      error: "Failed to withdraw",
    },
    onSuccess() {
      try {
        queryClient.invalidateQueries({ queryKey: ["strategy-status"] })
        queryClient.invalidateQueries({ queryKey: ["strategy"] })
      } catch (error) {
        console.error(error)
      }
    },
  })
}
