import { tradeService } from "@/app/trade/_services/trade.service"
import { getTitleDescriptionErrorMessages } from "@/utils/tx-error-messages"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Address, parseEther } from "viem"

// Transaction states type
export type TransactionState = "idle" | "approving" | "wrapping" | "posting"

// Common interface for transaction hooks
export interface UseTransactionStateProps {
  sendToken?: {
    symbol?: string
  }
  chain?: {
    id?: number
    blockExplorers?: {
      default: {
        url: string
      }
    }
  }
  wethAddresses: { [key: number]: Address | undefined }
}

export interface UseTransactionStateReturn {
  txState: TransactionState
  setTxState: React.Dispatch<React.SetStateAction<TransactionState>>
  isButtonLoading: boolean
  handleWrapEth: (params: {
    chainId?: number
    totalWrapping: number
    sendTransaction: (params: { to: Address; value: bigint }) => Promise<any>
  }) => Promise<void>
  handleApprove: <T>(params: {
    needsWrapping: boolean
    approveFunction: (
      params: T,
      options?: { onSuccess?: () => void; onError?: (error: any) => void },
    ) => Promise<any>
    approveParams: T
    onSuccess?: () => void
    handleWrapEth?: () => Promise<void>
    handlePostOrder?: () => Promise<void>
  }) => Promise<void>
  handlePostOrder: <T>(params: {
    postFunction: (
      params: T,
      options?: { onError?: (error: Error) => void },
    ) => Promise<any>
    postParams: T
  }) => Promise<void>
  handleTransactionError: (error: Error, context: string) => void
  getButtonText: (params: {
    isConnected: boolean
    errors: Record<string, any>
    tradeSide: string
    needsApproval?: boolean
  }) => React.ReactNode
  setupTransactionErrorHandling: (params: {
    wrappingHash?: `0x${string}`
    isSuccessWrapping: boolean
    isErrorWrapping: boolean
    resetSendTransaction?: () => void
    handlePostOrder: () => Promise<void>
  }) => void
}

export function useTransactionState({
  sendToken,
  chain,
  wethAddresses,
}: UseTransactionStateProps): UseTransactionStateReturn {
  // Transaction state
  const [txState, setTxState] = useState<TransactionState>("idle")

  // Handle transaction error
  const handleTransactionError = (error: Error, context: string) => {
    console.error(`Error ${context}:`, error)
    setTxState("idle")
    toast.error(`Failed to ${context}. Please try again.`)
  }

  // Handle wrapping ETH
  const handleWrapEth = async ({
    chainId,
    totalWrapping,
    sendTransaction,
  }: {
    chainId?: number
    totalWrapping: number
    sendTransaction: (params: { to: Address; value: bigint }) => Promise<any>
  }) => {
    if (!chainId || !wethAddresses[chainId]) {
      toast.error("Unsupported chain for wrapping ETH")
      setTxState("idle")
      return
    }

    setTxState("wrapping")
    try {
      await sendTransaction({
        to: wethAddresses[chainId] as Address,
        value: parseEther(totalWrapping.toString()),
      })
    } catch (error) {
      handleTransactionError(error as Error, "wrap ETH")
    }
  }

  // Handle approval
  const handleApprove = async <T>({
    needsWrapping,
    approveFunction,
    approveParams,
    onSuccess,
    handleWrapEth,
    handlePostOrder,
  }: {
    needsWrapping: boolean
    approveFunction: (
      params: T,
      options?: { onSuccess?: () => void; onError?: (error: any) => void },
    ) => Promise<any>
    approveParams: T
    onSuccess?: () => void
    handleWrapEth?: () => Promise<void>
    handlePostOrder?: () => Promise<void>
  }) => {
    setTxState("approving")
    try {
      await approveFunction(approveParams, {
        onSuccess: () => {
          if (onSuccess) {
            onSuccess()
          } else if (needsWrapping && handleWrapEth) {
            handleWrapEth()
          } else if (handlePostOrder) {
            handlePostOrder()
          }
        },
        onError: (error) => {
          setTxState("idle")
          toast.error(
            `Failed to approve ${sendToken?.symbol}. Please try again.`,
          )
        },
      })
    } catch (error) {
      handleTransactionError(error as Error, `approve ${sendToken?.symbol}`)
    }
  }

  // Handle posting order
  const handlePostOrder = async <T>({
    postFunction,
    postParams,
  }: {
    postFunction: (
      params: T,
      options?: { onError?: (error: Error) => void },
    ) => Promise<any>
    postParams: T
  }) => {
    setTxState("posting")
    try {
      await postFunction(postParams, {
        onError: (error: Error) => {
          setTxState("idle")
          toast.error("Failed to post the order")
          if (chain?.blockExplorers?.default.url) {
            tradeService.openTxFailedDialog(
              getTitleDescriptionErrorMessages(error),
            )
          }
        },
      })
    } catch (error) {
      handleTransactionError(error as Error, "post order")
    }
  }

  // Get button text based on transaction state
  const getButtonText = ({
    isConnected,
    errors,
    tradeSide,
    needsApproval,
  }: {
    isConnected: boolean
    errors: Record<string, any>
    tradeSide: string
    needsApproval?: boolean
  }) => {
    if (!isConnected) {
      return "Connect Wallet"
    }

    if (Object.keys(errors).length > 0) {
      return Array.isArray(errors.send) ? errors.send.join(", ") : errors.send
    }

    switch (txState) {
      case "approving":
        return `Approving ${sendToken?.symbol}`
      case "wrapping":
        return "Wrapping ETH"
      case "posting":
        return "Processing Order"
      default:
        if (needsApproval) {
          return `Approve ${sendToken?.symbol}`
        }
        return tradeSide === "buy" ? "Buy" : "Sell"
    }
  }

  // Setup transaction error handling for wrapping
  const setupTransactionErrorHandling = ({
    wrappingHash,
    isSuccessWrapping,
    isErrorWrapping,
    resetSendTransaction,
    handlePostOrder,
  }: {
    wrappingHash?: `0x${string}`
    isSuccessWrapping: boolean
    isErrorWrapping: boolean
    resetSendTransaction?: () => void
    handlePostOrder: () => Promise<void>
  }) => {
    useEffect(() => {
      if (wrappingHash && isSuccessWrapping) {
        toast.success("ETH wrapped successfully!")
        handlePostOrder()
      }

      if (isErrorWrapping) {
        console.error("Transaction failed or was rejected")
        setTxState("idle")
        toast.error("ETH wrapping failed. Please try again.")
        resetSendTransaction?.()
      }
    }, [wrappingHash, isSuccessWrapping, isErrorWrapping, resetSendTransaction])
  }

  // Button loading state
  const isButtonLoading = txState !== "idle"

  return {
    txState,
    setTxState,
    isButtonLoading,
    handleWrapEth,
    handleApprove,
    handlePostOrder,
    handleTransactionError,
    getButtonText,
    setupTransactionErrorHandling,
  }
}
