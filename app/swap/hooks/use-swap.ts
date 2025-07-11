import { publicMarketActions } from "@mangrovedao/mgv"
import { useConnectModal } from "@rainbow-me/rainbowkit"
import React from "react"
import { toast } from "sonner"
import { useAccount, useBalance } from "wagmi"

import { useOdos } from "@/hooks/odos/use-odos"
import { useMangroveAddresses } from "@/hooks/use-addresses"
import { useNetworkClient } from "@/hooks/use-network-client"
import { getExactWeiAmount } from "@/utils/regexp"

import { useSwapExecution } from "./use-swap-execution"
import { useSwapForm } from "./use-swap-form"
import { useSwapSimulation, useTokenPrices } from "./use-swap-simulation"
import { useSwapTokens } from "./use-swap-tokens"

export function useSwap() {
  const { isConnected, address } = useAccount()
  const { data: ethBalance } = useBalance({
    address,
  })

  const { openConnectModal } = useConnectModal()

  const {
    odosTokens,
    isOdosLoading,
  } = useOdos()

  const publicClient = useNetworkClient()
  const addresses = useMangroveAddresses()

  // Token selection and market setup
  const tokens = useSwapTokens(odosTokens)
  const {
    payToken,
    receiveToken,
    payTokenBalance,
    receiveTokenBalance,
    swapMarket,
    allTokens,
    tradableTokens,
    payTokenDialogOpen,
    setPayTokenDialogOpen,
    receiveTokenDialogOpen,
    setReceiveTokenDialogOpen,
    onPayTokenSelected,
    onReceiveTokenSelected,
    mangroveTradeableTokensForPayToken,
    reverseTokens,
  } = tokens

  // Create market client
  const marketClient =
    addresses && swapMarket
      ? publicClient?.extend(publicMarketActions(addresses, swapMarket))
      : undefined

  // Form handling (inputs, field values, etc.)
  const form = useSwapForm({
    payToken,
    receiveToken,
    reverseTokens,
    tokenBalance: payTokenBalance,
    ethBalance,
  })

  const {
    fields,
    onPayValueChange,
    onReceiveValueChange,
    handleReverseTokens,
    onMaxClicked,
    resetForm,
    slippage,
    setSlippage,
    showCustomInput,
    setShowCustomInput,
    isWrapping,
    setIsWrapping,
    totalWrapping,
    hasEnoughBalance,
  } = form

  // Determine if we should use Mangrove or Odos
  const isMangrove = !!marketClient

  // Swap simulation
  const simulateQuery = useSwapSimulation({
    payToken,
    receiveToken,
    payValue: fields.payValue,
    marketClient,
    isMangrove,
    slippage: slippage ?? "0.05",
  })

  // Effect to update receive value from simulation
  React.useEffect(() => {
    if (simulateQuery.data?.receiveValue) {
      form.setFields((fields) => ({
        ...fields,
        receiveValue: getExactWeiAmount(
          simulateQuery.data?.receiveValue ?? "",
          receiveToken?.priceDisplayDecimals ?? 18,
        ),
      }))
    }

    if (simulateQuery.data?.simulation.maxTickEncountered) {
      form.setMaxTickEncountered(
        simulateQuery.data?.simulation.maxTickEncountered,
      )
    }
  }, [simulateQuery.data?.receiveValue])

  // Execution
  const {
    isPendingWrapping,
    wrappingHash,
    postMarketOrder,
    approvePayToken,
  } = useSwapExecution()

  // Effect to update balances after wrapping
  React.useEffect(() => {
    if (wrappingHash) {
      toast.success("ETH wrapped successfully!")
      payTokenBalance.refetch()
      receiveTokenBalance.refetch()
    }
  }, [wrappingHash])

  // Button states and text
  const hasToApprove = simulateQuery.data?.approvalStep?.done === false

  const swapButtonText = React.useMemo(() => {
    if (!hasEnoughBalance) return "Insufficient balance"
    if (fields.payValue === "") return "Enter Pay amount"
    if (Number.parseFloat(fields.payValue) <= 0)
      return "Amount must be greater than 0"
    if (approvePayToken.isPending) return "Approval in progress..."
    if (totalWrapping > 0)
      return `Wrap ${getExactWeiAmount(totalWrapping.toString(), 3)} ETH`
    if (hasToApprove) return `Approve ${payToken?.symbol}`
    if (postMarketOrder.isPending) return "Processing transaction..."
    return `Swap via ${isMangrove ? "Oxium" : "Odos"}`
  }, [
    hasEnoughBalance,
    fields.payValue,
    approvePayToken.isPending,
    totalWrapping,
    hasToApprove,
    payToken?.symbol,
    postMarketOrder.isPending,
    isMangrove,
  ])

  const isReverseDisabled = !payToken || !receiveToken

  const isSwapDisabled =
    isReverseDisabled ||
    !hasEnoughBalance ||
    fields.payValue === "" ||
    fields.receiveValue === "" ||
    Number.parseFloat(fields.payValue) <= 0 ||
    Number.parseFloat(fields.receiveValue) <= 0 ||
    isOdosLoading ||
    approvePayToken.isPending ||
    postMarketOrder.isPending ||
    isPendingWrapping ||
    simulateQuery.isPending

  const isFieldLoading =
    isOdosLoading || (fields.payValue !== "" && simulateQuery.isPending)


  return {
    // Tokens
    payToken,
    receiveToken,
    allTokens,
    tradableTokens,
    mangroveTradeableTokensForPayToken,

    // Form
    fields,
    isFieldLoading,
    onPayValueChange,
    onReceiveValueChange,

    // Dialogs
    payTokenDialogOpen,
    setPayTokenDialogOpen,
    receiveTokenDialogOpen,
    setReceiveTokenDialogOpen,

    // Actions
    reverseTokens: handleReverseTokens,
    onPayTokenSelected,
    onReceiveTokenSelected,
    onMaxClicked,

    // State
    isConnected,
    openConnectModal,
    isReverseDisabled,
    isSwapDisabled,
    swapButtonText,

    // Prices
    simulateQuery,
    
    // Slippage
    setShowCustomInput,
    setSlippage,
    showCustomInput,
    slippage,

    // ETH wrapping
    ethBalance,
    isWrapping,
    setIsWrapping,

    // Balances
    payTokenBalance,
    receiveTokenBalance,
  }
}
