import { useMemo } from "react"
import { formatUnits, parseEther } from "viem"
import {
  useAccount,
  useSendTransaction,
  useWaitForTransactionReceipt,
} from "wagmi"

import { useLogics } from "@/hooks/use-addresses"
import { useInfiniteApproveToken } from "@/hooks/use-infinite-approve-token"
import { Logic } from "@mangrovedao/mgv"
import { BS } from "@mangrovedao/mgv/lib"

import { useTransactionState } from "../../hooks/use-transaction-state"
import { wethAdresses } from "../limit"
import { usePostLimitOrder } from "./use-post-limit-order"
import { useLimitSteps } from "./use-steps"

interface UseLimitTransactionProps {
  form: any
  tradeSide: BS
  sendToken?: any
  baseToken?: any
  sendTokenBalance: any
  isWrapping: boolean
}

export function useLimitTransaction({
  form,
  tradeSide,
  sendToken,
  baseToken,
  sendTokenBalance,
  isWrapping,
}: UseLimitTransactionProps) {
  const { isConnected, address, chain } = useAccount()

  const hookParams = useMemo(
    () => ({
      user: address,
      bs: tradeSide,
    }),
    [address, tradeSide],
  )

  const { data: limitOrderSteps } = useLimitSteps(hookParams)

  console.log("limitOrderSteps", limitOrderSteps, form.state.values)

  // Get logics
  const logics = useLogics()
  const logic = logics.find((l) => l?.name === form.state.values.sendFrom)

  // Approve mutation
  const approve = useInfiniteApproveToken()

  // Post order mutation
  const post = usePostLimitOrder({
    onResult: (result) => {
      setTxState("idle")
    },
  })

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
        formatUnits(sendTokenBalance?.balance || 0n, sendToken?.decimals ?? 18),
      )

  const totalWrapping = needsWrapping
    ? Number(form.state.values.send) -
      Number(
        formatUnits(sendTokenBalance?.balance || 0n, sendToken?.decimals ?? 18),
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
  const needsApproval = limitOrderSteps ? !limitOrderSteps[0].done : undefined

  // Handle posting order
  const handlePostOrder = async () => {
    setTxState("posting")
    try {
      await post.mutateAsync(
        {
          form: {
            ...form.state.values,
            send:
              baseToken?.symbol === "WETH"
                ? (Number(form.state.values.send) - 0.0000001).toString()
                : form.state.values.send,
          },
        },
        {
          onSettled: () => {
            setTxState("idle")
          },
        },
      )
    } catch (error) {
      console.error("Error posting order:", error)
      setTxState("idle")
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
        value: parseEther(totalWrapping.toString()),
      })
    } catch (error) {
      console.error("Error wrapping ETH:", error)
      setTxState("idle")
    }
  }

  // Handle approval
  const handleApprove = async () => {
    setTxState("approving")
    try {
      await approve.mutateAsync(
        {
          token: sendToken,
          logic: logic as Logic,
          spender: limitOrderSteps?.[0].params.spender,
        },
        {
          onSuccess: () => {
            if (needsWrapping) {
              handleWrapEth()
            } else {
              handlePostOrder()
            }
          },
          onError: (error) => {
            setTxState("idle")
          },
        },
      )
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

    // Check if approval is needed
    const needsApproval = limitOrderSteps && !limitOrderSteps[0].done

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
  }

  return {
    txState,
    isButtonLoading,
    onSubmit,
    getButtonText: (params: {
      isConnected: boolean
      errors: Record<string, any>
      tradeSide: string
    }) => getButtonText({ ...params, needsApproval }),
    needsWrapping,
    totalWrapping,
  }
}
