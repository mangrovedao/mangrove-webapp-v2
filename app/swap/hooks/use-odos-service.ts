import { useOdos } from "@/hooks/odos/use-odos"
import { useApproveToken } from "@/hooks/use-approve-token"
import { type Token } from "@mangrovedao/mgv"
import React from "react"
import { toast } from "sonner"
import { formatUnits, parseUnits } from "viem"
import { useAccount } from "wagmi"

export function useOdosService(initialValues: {
  payToken?: Token
  receiveToken?: Token
  fields: { payValue: string; receiveValue: string }
  slippage: string
  resetFields: () => void
  payTokenBalance: { refetch: () => void }
  receiveTokenBalance: { refetch: () => void }
}) {
  const { chainId, address } = useAccount()
  const approvePayToken = useApproveToken()

  // Use refs instead of state to avoid re-renders
  const payTokenRef = React.useRef<Token | undefined>(initialValues.payToken)
  const receiveTokenRef = React.useRef<Token | undefined>(
    initialValues.receiveToken,
  )
  const fieldsRef = React.useRef(initialValues.fields)
  const slippageRef = React.useRef(initialValues.slippage)
  const resetFieldsRef = React.useRef(initialValues.resetFields)
  const payTokenBalanceRef = React.useRef(initialValues.payTokenBalance)
  const receiveTokenBalanceRef = React.useRef(initialValues.receiveTokenBalance)

  const {
    getQuote,
    odosTokens,
    getAssembledTransactionOfLastQuote,
    executeOdosTransaction,
    hasToApproveOdos,
    odosRouterContractAddress,
    isOdosLoading,
  } = useOdos()

  async function swapOdos() {
    if (
      !chainId ||
      !payTokenRef.current?.address ||
      !receiveTokenRef.current?.address ||
      !fieldsRef.current.payValue
    )
      return

    const payAmount = parseUnits(
      fieldsRef.current.payValue,
      payTokenRef.current.decimals,
    )

    const hasToApprove = await hasToApproveOdos({
      address: payTokenRef.current.address,
      amount: payAmount,
    })

    if (hasToApprove) {
      await approvePayToken.mutate(
        {
          token: payTokenRef.current,
          spender: odosRouterContractAddress,
        },
        {
          onSuccess: () => {
            // Refetch simulation after approval
          },
        },
      )
      return
    }

    try {
      const simulation = await getQuote({
        chainId,
        inputTokens: [
          {
            tokenAddress: payTokenRef.current.address,
            amount: payAmount.toString(),
          },
        ],
        outputTokens: [
          { tokenAddress: receiveTokenRef.current.address, proportion: 1 },
        ],
        userAddr: address,
        slippageLimitPercent: Number(slippageRef.current),
      })

      const params = await getAssembledTransactionOfLastQuote()
      await executeOdosTransaction(params)

      resetFieldsRef.current()
      payTokenBalanceRef.current.refetch()
      receiveTokenBalanceRef.current.refetch()
    } catch (error) {
      console.error("Odos swap error:", error)
      toast.error("Failed to execute swap")
    }
  }

  async function getOdosQuote() {
    if (
      !chainId ||
      !payTokenRef.current?.address ||
      !receiveTokenRef.current?.address ||
      !fieldsRef.current.payValue ||
      !address
    )
      return null

    try {
      const payAmount = parseUnits(
        fieldsRef.current.payValue,
        payTokenRef.current.decimals,
      )

      const simulation = await getQuote({
        chainId,
        inputTokens: [
          {
            tokenAddress: payTokenRef.current.address,
            amount: payAmount.toString(),
          },
        ],
        outputTokens: [
          { tokenAddress: receiveTokenRef.current.address, proportion: 1 },
        ],
        userAddr: address,
        slippageLimitPercent: Number(slippageRef.current),
      })

      const hasToApprove = await hasToApproveOdos({
        address: payTokenRef.current.address,
        amount: simulation.baseAmount,
      })

      return {
        simulation,
        approvalStep: { done: !hasToApprove },
        receiveValue: formatUnits(
          simulation.quoteAmount,
          receiveTokenRef.current.priceDisplayDecimals ?? 18,
        ),
      }
    } catch (error) {
      console.error("Error fetching Odos quote:", error)
      return null
    }
  }

  return {
    swapOdos,
    getOdosQuote,
    odosTokens,
    isOdosLoading,
    odosRouterContractAddress,

    // Getter and setter for payToken
    get payToken() {
      return payTokenRef.current
    },
    set payToken(value: Token | undefined) {
      payTokenRef.current = value
    },

    // Getter and setter for receiveToken
    get receiveToken() {
      return receiveTokenRef.current
    },
    set receiveToken(value: Token | undefined) {
      receiveTokenRef.current = value
    },

    // Getter and setter for fields
    get fields() {
      return fieldsRef.current
    },
    set fields(value: { payValue: string; receiveValue: string }) {
      fieldsRef.current = value
    },

    // Getter and setter for slippage
    get slippage() {
      return slippageRef.current
    },
    set slippage(value: string) {
      slippageRef.current = value
    },

    // Getter and setter for resetFields
    get resetFields() {
      return resetFieldsRef.current
    },
    set resetFields(value: () => void) {
      resetFieldsRef.current = value
    },

    // Getter and setter for payTokenBalance
    get payTokenBalance() {
      return payTokenBalanceRef.current
    },
    set payTokenBalance(value: { refetch: () => void }) {
      payTokenBalanceRef.current = value
    },

    // Getter and setter for receiveTokenBalance
    get receiveTokenBalance() {
      return receiveTokenBalanceRef.current
    },
    set receiveTokenBalance(value: { refetch: () => void }) {
      receiveTokenBalanceRef.current = value
    },
  }
}
