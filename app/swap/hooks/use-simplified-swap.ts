import React from "react"
import { useAccount } from "wagmi"

import { useConnectModal } from "@rainbow-me/rainbowkit"
import { useFormState } from "./use-form-state"
import { useMarketInfrastructure } from "./use-market-infrastructure"
import { useOdosService } from "./use-odos-service"
import { useSimulation } from "./use-simulation"
import { useSwapFunctionality } from "./use-swap-functionality"
import { useTokenSelection } from "./use-token-selection"

export function useSimplifiedSwap() {
  const { isConnected } = useAccount()
  const { openConnectModal } = useConnectModal()

  // Initialize Odos service first to get tokens
  const odosService = useOdosService({
    payToken: undefined,
    receiveToken: undefined,
    fields: { payValue: "", receiveValue: "" },
    slippage: "0.5",
    resetFields: () => {},
    payTokenBalance: { refetch: () => {} },
    receiveTokenBalance: { refetch: () => {} },
  })

  // Initialize token selection with Odos tokens
  const tokenSelection = useTokenSelection(odosService.odosTokens)

  // Initialize form state
  const formState = useFormState({
    payToken: tokenSelection.payToken,
    receiveToken: tokenSelection.receiveToken,
    payTokenBalance: tokenSelection.payTokenBalance,
    reverseTokens: tokenSelection.reverseTokens,
  })

  // Initialize market infrastructure
  const marketInfra = useMarketInfrastructure({
    currentMarket: tokenSelection.currentMarket,
  })

  // Update Odos service with complete dependencies
  React.useEffect(() => {
    odosService.payToken = tokenSelection.payToken
    odosService.receiveToken = tokenSelection.receiveToken
    odosService.fields = formState.fields
    odosService.slippage = formState.slippage || "0.5"
    odosService.resetFields = formState.resetFields
    odosService.payTokenBalance = tokenSelection.payTokenBalance
    odosService.receiveTokenBalance = tokenSelection.receiveTokenBalance
  }, [
    tokenSelection.payToken,
    tokenSelection.receiveToken,
    formState.fields,
    formState.slippage,
    tokenSelection.payTokenBalance,
    tokenSelection.receiveTokenBalance,
  ])

  // Initialize simulation
  const simulation = useSimulation({
    payToken: tokenSelection.payToken,
    receiveToken: tokenSelection.receiveToken,
    marketClient: marketInfra.marketClient,
    currentMarket: tokenSelection.currentMarket,
    fields: formState.fields,
    slippage: formState.slippage || "0.5",
    pool: marketInfra.pool,
    spender: marketInfra.spender ?? undefined,
  })

  // Update receive value when simulation result changes
  React.useEffect(() => {
    if (simulation.simulateQuery.data?.receiveValue) {
      formState.updateReceiveValue(simulation.simulateQuery.data.receiveValue)
    }
  }, [simulation.simulateQuery.data?.receiveValue])

  // Initialize swap functionality
  const swapFunctionality = useSwapFunctionality({
    payToken: tokenSelection.payToken,
    receiveToken: tokenSelection.receiveToken,
    marketClient: marketInfra.marketClient,
    chain: marketInfra.chain,
    address: marketInfra.address,
    walletClient: marketInfra.walletClient,
    currentMarket: tokenSelection.currentMarket,
    fields: formState.fields,
    slippage: formState.slippage || "0.5",
    hasToApprove: simulation.hasToApprove,
    totalWrapping: formState.totalWrapping,
    spender: marketInfra.spender ?? undefined,
    pool: marketInfra.pool,
    payTokenBalance: tokenSelection.payTokenBalance,
    receiveTokenBalance: tokenSelection.receiveTokenBalance,
    resetFields: formState.resetFields,
  })

  // Function to reverse tokens
  function reverseTokens() {
    formState.reverseFieldValues()
  }

  return {
    // Token selection
    payToken: tokenSelection.payToken,
    receiveToken: tokenSelection.receiveToken,
    allTokens: tokenSelection.allTokens,
    tradableTokens: tokenSelection.tradableTokens,
    mangroveTradeableTokensForPayToken:
      tokenSelection.mangroveTradeableTokensForPayToken,
    payTokenDialogOpen: tokenSelection.payTokenDialogOpen,
    setPayTokenDialogOpen: tokenSelection.setPayTokenDialogOpen,
    receiveTokenDialogOpen: tokenSelection.receiveTokenDialogOpen,
    setReceiveTokenDialogOpen: tokenSelection.setReceiveTokenDialogOpen,
    onPayTokenSelected: tokenSelection.onPayTokenSelected,
    onReceiveTokenSelected: tokenSelection.onReceiveTokenSelected,
    payTokenBalance: tokenSelection.payTokenBalance,
    receiveTokenBalance: tokenSelection.receiveTokenBalance,

    // Form state
    fields: formState.fields,
    onPayValueChange: formState.onPayValueChange,
    onReceiveValueChange: formState.onReceiveValueChange,
    onMaxClicked: formState.onMaxClicked,
    slippage: formState.slippage,
    setSlippage: formState.setSlippage,
    showCustomInput: formState.showCustomInput,
    setShowCustomInput: formState.setShowCustomInput,
    isWrapping: formState.isWrapping,
    setIsWrapping: formState.setIsWrapping,
    ethBalance: formState.ethBalance,
    hasEnoughBalance: formState.hasEnoughBalance,

    // Simulation
    isFieldLoading: simulation.isFieldLoading || odosService.isOdosLoading,

    // Market price
    payDollar: simulation.getMarketPriceQuery.data?.payDollar ?? 0,
    receiveDollar: simulation.getMarketPriceQuery.data?.receiveDollar ?? 0,
    isFetchingDollarValue: simulation.getMarketPriceQuery.isFetching,

    // Swap functionality
    reverseTokens,
    swap: swapFunctionality.swap,
    swapButtonText: swapFunctionality.swapButtonText,
    isSwapDisabled:
      swapFunctionality.isSwapDisabled || !formState.hasEnoughBalance,
    isReverseDisabled: !tokenSelection.payToken || !tokenSelection.receiveToken,

    // Connection
    isConnected,
    openConnectModal,

    // Service info
    serviceName: marketInfra.marketClient ? "Mangrove" : "Odos",
  }
}
