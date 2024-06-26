import { TransactionReceipt } from "@ethersproject/providers"

type Props = {
  onResult?: (result: TransactionReceipt) => void
}

export function usePostAmplifiedOrder({ onResult }: Props = {}) {
  // const { mangrove, marketsInfoQuery } = useMangrove()
  // const { currentMarket: market } = useMarket()
  // const resolveWhenBlockIsIndexed = useResolveWhenBlockIsIndexed()
  // const queryClient = useQueryClient()
  // const [startLoading, stopLoading] = useLoadingStore((state) => [
  //   state.startLoading,
  //   state.stopLoading,
  // ])
  // return useMutation({
  //   mutationFn: async ({
  //     form,
  //   }: {
  //     form: Omit<Form, "assets"> & {
  //       selectedToken?: Token
  //       selectedSource?: Logic
  //       sendAmount: string
  //       assetsWithTokens: AssetWithInfos[]
  //     }
  //   }) => {
  //     try {
  //       if (!mangrove || !market || !form.selectedToken || !form.selectedSource)
  //         return
  //       const { data: openMarkets } = marketsInfoQuery
  //       const amp = new MangroveAmplifier({ mgv: mangrove })
  //       const assets = form.assetsWithTokens.map((asset) => {
  //         return {
  //           inboundTokenAddress: asset.token?.address,
  //           inboundTokenId: asset.token?.address,
  //           inboundLogic: asset.receiveTo,
  //           tickspacing: market.tickSpacing,
  //           limitPrice: asset.limitPrice,
  //         }
  //       })
  //       type Assets = {
  //         inboundToken: string | undefined
  //         inboundLogic: DefaultTradeLogics
  //         tickSpacing: number
  //         tick: number
  //       }[]
  //       const hasLogic = (
  //         token: Assets[0],
  //       ): token is Omit<Assets[0], "inboundLogic" | "inboundToken"> & {
  //         inboundLogic:
  //           | SimpleLogic
  //           | SimpleAaveLogic
  //           | OrbitLogic
  //           | ZeroLendLogic
  //           | PacFinanceLogic
  //         inboundToken: string
  //       } => {
  //         return (
  //           token.inboundLogic !== undefined && token.inboundToken !== undefined
  //         )
  //       }
  //       // const inboundTokens = assets
  //       //   .map((asset) => {
  //       //     const market = openMarkets?.find((market) => {
  //       //       return (
  //       //         (market.base.id === asset.inboundTokenId &&
  //       //           market.quote.id === form.selectedToken?.address) ||
  //       //         (market.quote.id === asset.inboundTokenId &&
  //       //           market.base.id === form.selectedToken?.address)
  //       //       )
  //       //     })
  //       //     const ba =
  //       //       market?.base.id === asset.inboundTokenId ? "bids" : "asks"
  //       //     const priceHelper = new TickPriceHelper(ba, market!)
  //       //     const tick = priceHelper.tickFromPrice(
  //       //       asset?.limitPrice || "0",
  //       //       "nearest",
  //       //     )
  //       //     return {
  //       //       inboundToken: asset.inboundTokenAddress,
  //       //       inboundLogic: asset.inboundLogic,
  //       //       tickSpacing: asset.tickspacing,
  //       //       tick,
  //       //     }
  //       //   })
  //       //   .filter(hasLogic)
  //       // //TODO: check why we don't have tx hash
  //       // const bundle = await amp.addBundle({
  //       //   outboundToken: form.selectedToken.address,
  //       //   outboundVolume: parseUnits(
  //       //     form.sendAmount,
  //       //     form.selectedToken.decimals,
  //       //   ),
  //       //   outboundLogic: form.selectedSource,
  //       //   expiryDate:
  //       //     form.timeInForce === TimeInForce.GOOD_TIL_TIME
  //       //       ? estimateTimestamp({
  //       //           timeToLiveUnit: form.timeToLiveUnit,
  //       //           timeToLive: form.timeToLive,
  //       //         })
  //       //       : 0,
  //       //   inboundTokens,
  //       // })
  //       // const tx = (await bundle.response).wait()
  //       // const hash = await tx
  //       toast.success("Amplified order posted successfully")
  //       return { tx: "hash" }
  //     } catch (error) {
  //       console.error(error)
  //       toast.error(`Failed to post the amplified order`)
  //     }
  //   },
  //   meta: {
  //     error: "Failed to post the limit order",
  //   },
  //   onSuccess: async (data) => {
  //     /*
  //      * We use a custom callback to handle the success message once it's ready.
  //      * This is because the onSuccess callback from the mutation will only be triggered
  //      * after all the preceding logic has been executed.
  //      */
  //     const { tx } = data ?? {}
  //     try {
  //       // if (!tx) return
  //       // onResult?.(tx)
  //       // // Start showing loading state indicator on parts of the UI that depend on
  //       // startLoading([TRADE.TABLES.ORDERS, TRADE.TABLES.FILLS])
  //       // const blockNumber = tx.blockNumber
  //       // await resolveWhenBlockIsIndexed.mutateAsync({
  //       //   blockNumber,
  //       // })
  //       queryClient.invalidateQueries({ queryKey: ["orders"] })
  //       queryClient.invalidateQueries({ queryKey: ["fills"] })
  //       queryClient.invalidateQueries({ queryKey: ["amplified"] })
  //     } catch (error) {
  //       console.error(error)
  //     }
  //   },
  //   onSettled: () => {
  //     stopLoading([TRADE.TABLES.ORDERS, TRADE.TABLES.FILLS])
  //   },
  // })
}
