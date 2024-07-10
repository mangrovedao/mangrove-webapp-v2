import useKandelInstance from "@/app/strategies/(shared)/_hooks/use-kandel-instance"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export function useDeposit({
  kandelInstance,
  volumes,
}: {
  kandelInstance?: ReturnType<typeof useKandelInstance>
  volumes: { baseAmount?: string; quoteAmount?: string }
}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      try {
        if (!kandelInstance) {
          throw new Error("Strategy Instance could not be fetched")
        }
        const { baseAmount, quoteAmount } = volumes
        // note: to re-implement
        // const approvalTxs = await kandelInstance?.approveIfHigher(
        //   baseAmount,
        //   quoteAmount,
        // )

        // // Wait for all the transactions to be approved
        // await Promise.all(approvalTxs.map((tx) => tx?.wait()))

        // // Deposit
        // const depositRes = await kandelInstance?.deposit({
        //   baseAmount,
        //   quoteAmount,
        // })

        // await depositRes.wait()

        // const res = await depositRes.wait()

        toast.success("Deposited successfully")
        // return res.blockNumber
        // TODO: refetch historic data and overview/params data
      } catch (err) {
        console.error(err)
        toast.error("Could not deposit")
        throw new Error("Could not deposit")
      }
    },
    meta: {
      error: "Failed to deposit",
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
