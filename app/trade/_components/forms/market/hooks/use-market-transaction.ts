import { useApproveAmount } from "@/hooks/ghostbook/hooks/use-approve-amount"
import { useRegistry } from "@/hooks/ghostbook/hooks/use-registry"
import { useSelectedPool } from "@/hooks/new_ghostbook/use-selected-pool"
import { BS } from "@mangrovedao/mgv/lib"
import { MarketOrderSteps } from "@mangrovedao/mgv/types"
import { useEffect } from "react"
import { toast } from "sonner"
import { formatUnits } from "viem"
import {
  useAccount,
  useSendTransaction,
  useWaitForTransactionReceipt,
} from "wagmi"
import { useTransactionState } from "../../hooks/use-transaction-state"
import { wethAdresses } from "../market"
import { usePostMarketOrder } from "./use-post-market-order"
import { usePostMarketOrderMangrove } from "./use-post-market.order-mangrove"
import { useMarketSteps } from "./use-steps"

interface UseMarketTransactionProps {
  form: any
  tradeSide: BS
  sendToken?: any
  baseToken?: any
  sendTokenBalance: any
  maxTickEncountered: bigint
  isWrapping: boolean
  onTransactionSuccess?: () => void
}

export function useMarketTransaction({
  form,
  tradeSide,
  sendToken,
  maxTickEncountered,
  baseToken,
  sendTokenBalance,
  isWrapping,
  onTransactionSuccess = () => {},
}: UseMarketTransactionProps) {
  const { isConnected, address, chain } = useAccount()
  const { mangroveChain } = useRegistry()
  const { selectedPool: pool } = useSelectedPool()

  // Market steps to check if approval is needed
  const { data: marketOrderSteps, refetch: refetchSteps } = useMarketSteps({
    user: address,
    bs: tradeSide,
    sendAmount: form.state.values.send,
    sendToken,
  })

  const spender =
    chain?.testnet || !pool
      ? (marketOrderSteps as MarketOrderSteps)?.[0]?.params.spender
      : mangroveChain?.ghostbook

  // Approve mutation
  const approveAmount = useApproveAmount({
    token: sendToken,
    spender,
    sendAmount: form.state.values.send,
  })

  // Post order mutation
  const postMangrove = usePostMarketOrderMangrove({
    onResult: (result) => {
      setTxState("idle")
      onTransactionSuccess()
    },
  })

  const postMarket = usePostMarketOrder()

  // Post order mutation
  const post = chain?.testnet || !pool ? postMangrove : postMarket

  // Wrapping ETH
  const {
    data: wrappingHash,
    isPending: isPendingWrapping,
    sendTransaction,
    reset: resetSendTransaction,
  } = useSendTransaction()

  const {
    isLoading: isLoadingWrapping,
    isSuccess: isSuccessWrapping,
    isError: isErrorWrapping,
  } = useWaitForTransactionReceipt({
    hash: wrappingHash,
  })

  // Calculate if wrapping is needed
  const needsWrapping =
    isWrapping &&
    Number(form.state.values.send) >
      Number(
        formatUnits(
          sendTokenBalance.balance?.balance || 0n,
          sendToken?.decimals ?? 18,
        ),
      )

  const totalWrapping = needsWrapping
    ? Number(form.state.values.send) -
      Number(
        formatUnits(
          sendTokenBalance.balance?.balance || 0n,
          sendToken?.decimals ?? 18,
        ),
      )
    : 0

  // Use the transaction state hook
  const {
    txState,
    setTxState,
    isButtonLoading,
    getButtonText,
    setupTransactionErrorHandling,
  } = useTransactionState({
    sendToken,
    chain,
    wethAddresses: wethAdresses,
  })

  // Check if approval is needed
  const needsApproval = marketOrderSteps ? !marketOrderSteps[0].done : undefined

  // Handle posting order
  const handlePostOrder = async () => {
    setTxState("posting")
    try {
      const result = await post.mutateAsync(
        {
          form: {
            ...form.state.values,
            send:
              baseToken?.symbol === "WETH"
                ? (Number(form.state.values.send) - 0.0000001).toString()
                : form.state.values.send,
            maxTickEncountered,
          },
        },

        {
          onSettled: () => {
            setTxState("idle")
            form.reset()
          },
        },
      )

      if (result?.receipt?.status === "success" && onTransactionSuccess) {
        onTransactionSuccess()
      }
    } catch (error) {
      setTxState("idle")
      toast.error("Failed to post the market order")
    }
  }

  // Handle wrapping ETH
  const handleWrapEth = async () => {
    if (!chain?.id || !wethAdresses[chain.id]) {
      setTxState("idle")
      return
    }

    setTxState("wrapping")
    try {
      await sendTransaction({
        to: wethAdresses[chain.id],
        value: BigInt(Math.floor(totalWrapping * 10 ** 18)),
      })
      setTxState("idle")
    } catch (error) {
      console.error("Error wrapping ETH:", error)
      setTxState("idle")
    }
  }

  // Handle approval
  const handleApprove = async () => {
    setTxState("approving")
    try {
      await approveAmount.mutateAsync(undefined, {
        onSuccess: () => {
          refetchSteps()
          setTxState("idle")
        },
        onError: (error) => {
          setTxState("idle")
        },
      })
    } catch (error) {
      setTxState("idle")
      console.error("Error approving token:", error)
    }
  }

  // Setup transaction error handling for wrapping
  setupTransactionErrorHandling({
    wrappingHash,
    isSuccessWrapping,
    isErrorWrapping,
    resetSendTransaction,
    handlePostOrder,
  })

  // Handle form submission
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isConnected) return

    // Reset any previous transaction state
    setTxState("idle")

    // // Set a safety timeout to reset the state if the transaction is taking too long
    // const safetyTimeout = setTimeout(() => {
    //   // Only reset if we're still in a non-idle state after the timeout
    //   if (txState !== "idle") {
    //     setTxState("idle")
    //   }
    // }, 8000) // 8 seconds should be enough for most wallet interactions

    try {
      if (needsApproval) {
        handleApprove()
      } else if (needsWrapping) {
        handleWrapEth()
      } else {
        handlePostOrder()
      }
    } catch (error) {
      console.error("Transaction error:", error)
      setTxState("idle")
    }

    // Clear the safety timeout when the function completes
    // return () => clearTimeout(safetyTimeout)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setTxState("idle")
    }
  }, [])

  return {
    txState,
    isButtonLoading,
    onSubmit,
    getButtonText,
    needsWrapping,
    totalWrapping,
    needsApproval,
    approveAmount,
    marketOrderSteps,
  }
}
