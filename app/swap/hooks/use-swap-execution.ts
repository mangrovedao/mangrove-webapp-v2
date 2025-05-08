import { BS } from "@mangrovedao/mgv/lib"
import { toast } from "sonner"
import { parseEther } from "viem"
import { useAccount, useSendTransaction, useWalletClient } from "wagmi"

import { useSpenderAddress } from "@/app/trade/_components/forms/hooks/use-spender-address"
import { usePostMarketOrder } from "@/app/trade/_components/forms/market/hooks/use-post-market-order"
import { usePostMarketOrderMangrove } from "@/app/trade/_components/forms/market/hooks/use-post-market.order-mangrove"
import { usePool } from "@/hooks/new_ghostbook/pool"
import { useApproveToken } from "@/hooks/use-approve-token"
import useMarket from "@/providers/market"
import { useDisclaimerDialog } from "@/stores/disclaimer-dialog.store"
import { WETH_ADDRESSES } from "../utils/swap-constants"

export function useSwapExecution() {
  const { chain, address, chainId } = useAccount()
  const { data: walletClient } = useWalletClient()
  const { checkAndShowDisclaimer } = useDisclaimerDialog()
  const approvePayToken = useApproveToken()
  const { data: spender } = useSpenderAddress("market")

  const {
    data: wrappingHash,
    isPending: isPendingWrapping,
    sendTransaction,
  } = useSendTransaction()

  const { pool } = usePool()
  const mangroveMarketOrder = usePostMarketOrderMangrove()
  const regularMarketOrder = usePostMarketOrder()
  const postMarketOrder =
    chain?.testnet || !pool ? mangroveMarketOrder : regularMarketOrder

  const { currentMarket } = useMarket()

  // Odos swap execution
  async function swapOdos({
    hasToApprove,
    payToken,
    odosRouterContractAddress,
    getAssembledTransactionOfLastQuote,
    executeOdosTransaction,
    payTokenBalance,
    receiveTokenBalance,
    resetForm,
  }: {
    hasToApprove: boolean
    payToken: any
    odosRouterContractAddress: string
    getAssembledTransactionOfLastQuote: () => Promise<any>
    executeOdosTransaction: (params: any) => Promise<any>
    payTokenBalance: { refetch: () => void }
    receiveTokenBalance: { refetch: () => void }
    resetForm: () => void
  }) {
    if (hasToApprove) {
      await approvePayToken.mutate(
        {
          token: payToken,
          spender: odosRouterContractAddress,
        },
        {
          onSuccess: () => {
            // Simulate again to update approval status
            return true
          },
        },
      )
      return
    }

    const params = await getAssembledTransactionOfLastQuote()
    await executeOdosTransaction(params)
    resetForm()
    payTokenBalance.refetch()
    receiveTokenBalance.refetch()
  }

  // Mangrove swap execution
  async function swapMangrove({
    marketClient,
    address,
    walletClient,
    payToken,
    receiveToken,
    totalWrapping,
    hasToApprove,
    fields,
    slippage,
    payTokenBalance,
    receiveTokenBalance,
    resetForm,
    simulationData,
  }: {
    marketClient: any
    address: string
    walletClient: any
    payToken: any
    receiveToken: any
    totalWrapping: number
    hasToApprove: boolean
    fields: { payValue: string; receiveValue: string }
    slippage: string
    payTokenBalance: { refetch: () => void }
    receiveTokenBalance: { refetch: () => void }
    resetForm: () => void
    simulationData?: any
  }) {
    if (totalWrapping > 0) {
      sendTransaction({
        to: WETH_ADDRESSES[chainId ?? 0],
        value: parseEther(totalWrapping.toString()),
      })
      return
    }

    if (hasToApprove) {
      await approvePayToken.mutate(
        {
          token: payToken,
          spender,
        },
        {
          onSuccess: () => {
            // Simulate again to update approval status
            return true
          },
        },
      )
      return
    }

    // Determine buy/sell direction based on the currentMarket from the context
    const isBuyingBase =
      currentMarket?.base.address.toLowerCase() ===
      receiveToken.address.toLowerCase()
    const tradeSide = isBuyingBase ? BS.buy : BS.sell

    await postMarketOrder.mutateAsync(
      {
        form: {
          bs: tradeSide,
          receive: fields.receiveValue,
          send: fields.payValue,
          isWrapping: false,
          slippage: Number(slippage),
        },
        ...(chain?.testnet || !pool
          ? {
              swapMarket: currentMarket,
              swapMarketClient: marketClient,
              maxTickEncountered: simulationData?.maxTickEncountered,
            }
          : {}),
      },
      {
        onError: (error) => {
          console.error("Swap error:", error)
          toast.error("Failed to execute swap")
        },
        onSuccess: () => {
          resetForm()
          payTokenBalance.refetch()
          receiveTokenBalance.refetch()
        },
      },
    )
  }

  // Main swap function that routes to the correct execution method
  async function executeSwap({
    isMangrove = true,
    marketClient,
    payToken,
    receiveToken,
    hasToApprove,
    fields,
    slippage,
    totalWrapping,
    payTokenBalance,
    receiveTokenBalance,
    resetForm,
    simulationData,
    // Odos specific params
    odosRouterContractAddress,
    getAssembledTransactionOfLastQuote,
    executeOdosTransaction,
  }: {
    isMangrove?: boolean
    marketClient?: any
    payToken: any
    receiveToken: any
    hasToApprove: boolean
    fields: { payValue: string; receiveValue: string }
    slippage: string
    totalWrapping: number
    payTokenBalance: { refetch: () => void }
    receiveTokenBalance: { refetch: () => void }
    resetForm: () => void
    simulationData?: any
    // Odos specific params
    odosRouterContractAddress?: string
    getAssembledTransactionOfLastQuote?: () => Promise<any>
    executeOdosTransaction?: (params: any) => Promise<any>
  }) {
    if (checkAndShowDisclaimer(address)) return

    if (isMangrove && marketClient) {
      await swapMangrove({
        marketClient,
        address: address as string,
        walletClient,
        payToken,
        receiveToken,
        totalWrapping,
        hasToApprove,
        fields,
        slippage,
        payTokenBalance,
        receiveTokenBalance,
        resetForm,
        simulationData,
      })
    } else if (
      !isMangrove &&
      odosRouterContractAddress &&
      getAssembledTransactionOfLastQuote &&
      executeOdosTransaction
    ) {
      await swapOdos({
        hasToApprove,
        payToken,
        odosRouterContractAddress,
        getAssembledTransactionOfLastQuote,
        executeOdosTransaction,
        payTokenBalance,
        receiveTokenBalance,
        resetForm,
      })
    } else {
      toast.error("Swap execution failed: missing required parameters")
    }
  }

  return {
    executeSwap,
    isPendingWrapping,
    wrappingHash,
    postMarketOrder,
    approvePayToken,
  }
}
