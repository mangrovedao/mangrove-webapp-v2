import { BS } from "@mangrovedao/mgv/lib"
import React from "react"
import { Address, erc20Abi, parseEther } from "viem"
import {
  simulateContract,
  waitForTransactionReceipt,
  writeContract,
} from "viem/actions"
import { useSendTransaction } from "wagmi"

import { usePostMarketOrder } from "@/app/trade/_components/forms/market/hooks/use-post-market-order"
import { usePostMarketOrderMangrove } from "@/app/trade/_components/forms/market/hooks/use-post-market-order-mangrove"
import { useApproveToken } from "@/hooks/use-approve-token"
import { useDisclaimerDialog } from "@/stores/disclaimer-dialog.store"
import { useSelectedPoolStore } from "@/stores/selected-pool.store"
import { type Token } from "@mangrovedao/mgv"
import { toast } from "sonner"
import { wethAdresses } from "./use-swap"

export function useSwapFunctionality({
  payToken,
  receiveToken,
  marketClient,
  chain,
  address,
  walletClient,
  currentMarket,
  fields,
  slippage,
  hasToApprove,
  totalWrapping,
  spender,
  pool,
  payTokenBalance,
  receiveTokenBalance,
  resetFields,
}: {
  payToken?: Token
  receiveToken?: Token
  marketClient: any
  chain: any
  address?: Address
  walletClient: any
  currentMarket: any
  fields: { payValue: string; receiveValue: string }
  slippage: string
  hasToApprove: boolean
  totalWrapping: number
  spender: Address | undefined
  pool: any
  payTokenBalance: { refetch: () => void }
  receiveTokenBalance: { refetch: () => void }
  resetFields: () => void
}) {
  const { checkAndShowDisclaimer } = useDisclaimerDialog()
  const approvePayToken = useApproveToken()
  const { selectedPool, setSelectedPool } = useSelectedPoolStore()
  const {
    data: wrappingHash,
    isPending: isPendingWrapping,
    sendTransaction,
  } = useSendTransaction()
  const mangroveMarketOrder = usePostMarketOrderMangrove()
  const regularMarketOrder = usePostMarketOrder()
  const postMarketOrder =
    chain?.testnet || !pool ? mangroveMarketOrder : regularMarketOrder

  React.useEffect(() => {
    if (wrappingHash) {
      toast.success("ETH wrapped successfully!")
      payTokenBalance.refetch()
      receiveTokenBalance.refetch()
    }
  }, [wrappingHash, payTokenBalance, receiveTokenBalance])

  // Direct token approval function that matches the working implementations
  async function directApproveToken() {
    if (!payToken || !walletClient || !address || !spender) {
      toast.error("Missing information for approval")
      return false
    }

    try {
      // Use max uint256 for unlimited approval
      const MAX_UINT256 = 2n ** 256n - 1n

      // Directly use viem to call the approve function on the token
      const { request } = await simulateContract(walletClient, {
        address: payToken.address as Address,
        abi: erc20Abi,
        functionName: "approve",
        args: [spender, MAX_UINT256],
      })

      const hash = await writeContract(walletClient, request as any)

      // Wait for the transaction to complete
      const receipt = await waitForTransactionReceipt(walletClient, { hash })

      if (receipt.status !== "success") {
        throw new Error(`Approval transaction failed: ${hash}`)
      }

      toast.success(`${payToken.symbol} approved successfully`)
      return true
    } catch (error) {
      console.error("Token approval error:", error)
      toast.error(`Failed to approve ${payToken.symbol}`)
      return false
    }
  }

  async function swapMangrove() {
    if (!(marketClient && address && walletClient && payToken && receiveToken))
      return

    if (totalWrapping > 0) {
      sendTransaction({
        to: wethAdresses[chain?.id ?? 0],
        value: parseEther(totalWrapping.toString()),
      })

      return
    }

    // Handle token approval if needed
    if (hasToApprove) {
      const approved = await directApproveToken()
      if (!approved) {
        console.error("Token approval failed")
        return
      }

      // Add a short delay to ensure approval is processed
      await new Promise((resolve) => setTimeout(resolve, 3000))
    }

    // Get base/quote to determine buy/sell direction
    const isBasePay = currentMarket?.base.address === payToken.address

    // Determine the buy/sell direction
    const tradeDirection = isBasePay ? BS.buy : BS.sell

    // Set the selected pool
    setSelectedPool(pool)
    console.log(fields, approvePayToken.isPending, postMarketOrder.isPending)
    // Execute the trade using the market order mutation
    await postMarketOrder.mutateAsync(
      {
        form: {
          bs: tradeDirection,
          receive: fields.receiveValue,
          send: fields.payValue,
          isWrapping: false,
          slippage: Number(slippage),
        },
        ...(!chain?.testnet || pool
          ? {
              swapMarket: currentMarket,
            }
          : {}),
      },
      {
        onError: (error) => {
          console.error("Swap error:", error)
          toast.error("Failed to execute swap")
        },
        onSuccess: () => {
          resetFields()
          payTokenBalance.refetch()
          receiveTokenBalance.refetch()
          toast.success("Swap completed successfully")
        },
      },
    )
  }

  async function swap() {
    if (checkAndShowDisclaimer(address)) return
    await swapMangrove()
  }

  const swapButtonText = React.useMemo(() => {
    if (fields.payValue === "") return "Enter Pay amount"
    if (Number.parseFloat(fields.payValue) <= 0)
      return "Amount must be greater than 0"
    if (approvePayToken.isPending) return "Approval in progress..."
    if (totalWrapping > 0) return `Wrap ETH`
    if (hasToApprove) return `Approve ${payToken?.symbol}`
    if (postMarketOrder.isPending) return "Processing transaction..."
    return `Swap via Mangrove`
  }, [
    fields.payValue,
    approvePayToken.isPending,
    totalWrapping,
    hasToApprove,
    payToken?.symbol,
    postMarketOrder.isPending,
  ])

  //   console.log(fields, approvePayToken.isPending, postMarketOrder.isPending)
  const isSwapDisabled =
    !payToken ||
    !receiveToken ||
    fields.payValue === "" ||
    fields.receiveValue === "" ||
    Number(fields.payValue) <= 0 ||
    Number(fields.receiveValue) <= 0 ||
    approvePayToken.isPending ||
    postMarketOrder.isPending ||
    isPendingWrapping

  return {
    swap,
    swapButtonText,
    isSwapDisabled,
    isPendingWrapping,
    approvePayToken,
    postMarketOrder,
  }
}
