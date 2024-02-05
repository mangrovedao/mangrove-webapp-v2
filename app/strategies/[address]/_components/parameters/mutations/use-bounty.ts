import { GeometricKandelInstance } from "@mangrovedao/mangrove.js"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

export function useBounty({
  stratInstance,
  bounty,
}: {
  stratInstance?: GeometricKandelInstance
  bounty: string
}) {
  return useMutation({
    mutationFn: async () => {
      try {
        if (!stratInstance) {
          throw new Error("Strategy Instance could not be fetched")
        }

        // const txs = await stratInstance.populateGeneralChunks({
        //     funds: bounty,
        //     parameters: { gasprice: globalConfig?.gasprice },
        //   });

        // const res = txs && (await Promise.all(txs.map((tx) => tx?.wait())))

        // const approvalTxs = await stratInstance?.approveIfHigher(
        //   baseAmount,
        //   quoteAmount,
        // )

        // // Wait for all the transactions to be approved
        // await Promise.all(approvalTxs.map((tx) => tx?.wait()))

        // // Deposit
        // const depositRes = await stratInstance?.deposit({
        //   baseAmount,
        //   quoteAmount,
        // })

        // await depositRes.wait()

        // const res = await depositRes.wait()

        // toast.success("Deposited successfully")
        // return res.blockNumber
        // TODO: refetch historic data and overview/params data
      } catch (err) {
        console.error(err)
        toast.error("Could not deposit")
      }
    },
    meta: {
      error: "Failed to deposit",
    },
  })
}
