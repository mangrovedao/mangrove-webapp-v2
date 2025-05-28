import { type Token } from "@mangrovedao/mgv"
import React from "react"
import { formatUnits } from "viem"

import { getExactWeiAmount } from "@/utils/regexp"
import { SwapFields } from "../utils/swap-types"

interface UseSwapFormProps {
  payToken?: Token
  receiveToken?: Token
  receiveValueFromSimulation?: string
  reverseTokens: () => void
  tokenBalance?: { balance?: bigint }
  ethBalance?: { value?: bigint; decimals?: number }
}

export function useSwapForm({
  payToken,
  receiveToken,
  receiveValueFromSimulation,
  reverseTokens,
  tokenBalance,
  ethBalance,
}: UseSwapFormProps) {
  const [showCustomInput, setShowCustomInput] = React.useState(false)
  const [slippage, setSlippage] = React.useState(9) //!!SLIPPAGES[1] hardcoded slippage of 9% for now on SEI
  const [isWrapping, setIsWrapping] = React.useState(false)
  const [maxTickEncountered, setMaxTickEncountered] = React.useState<bigint>(0n)

  const [fields, setFields] = React.useState<SwapFields>({
    payValue: "",
    receiveValue: "",
  })

  // Update receive value when simulation changes
  React.useEffect(() => {
    if (receiveValueFromSimulation) {
      setFields((fields) => ({
        ...fields,
        receiveValue: getExactWeiAmount(
          receiveValueFromSimulation,
          receiveToken?.priceDisplayDecimals ?? 18,
        ),
      }))
    }
  }, [receiveValueFromSimulation, receiveToken?.priceDisplayDecimals])

  function onPayValueChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFields((fields) => ({ ...fields, payValue: e.target.value }))
  }

  function onReceiveValueChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFields((fields) => ({ ...fields, receiveValue: e.target.value }))
  }

  function onMaxClicked() {
    const payTokenDecimals = payToken?.decimals ?? 18
    const ethDecimals = ethBalance?.decimals ?? 18

    const payTokenAmount = formatUnits(
      tokenBalance?.balance ?? 0n,
      payTokenDecimals,
    )

    if (!isWrapping) {
      setFields((fields) => ({
        ...fields,
        payValue: payTokenAmount,
      }))
      return
    }

    const ethAmount = formatUnits(ethBalance?.value ?? 0n, ethDecimals)
    const totalAmount = Number(ethAmount) + Number(payTokenAmount)

    setFields((fields) => ({
      ...fields,
      payValue: getExactWeiAmount(totalAmount.toString(), payTokenDecimals),
    }))
  }

  function handleReverseTokens() {
    reverseTokens()
    setFields((fields) => ({
      payValue: fields.receiveValue,
      receiveValue: fields.payValue,
    }))
  }

  function resetForm() {
    setFields({
      payValue: "",
      receiveValue: "",
    })
  }

  const totalWrapping = React.useMemo(() => {
    if (!fields.payValue || !payToken) return 0

    const payTokenBalanceFormatted = Number(
      formatUnits(tokenBalance?.balance || 0n, payToken.decimals ?? 18),
    )
    const payValueNum = Number(fields.payValue)

    if (payValueNum <= payTokenBalanceFormatted) return 0

    return payValueNum - payTokenBalanceFormatted
  }, [fields.payValue, payToken, tokenBalance?.balance, ethBalance?.value])

  const hasEnoughBalance = React.useMemo(() => {
    if (!fields.payValue || !payToken) return false

    try {
      const availableBalance =
        isWrapping && totalWrapping > 0
          ? formatUnits(
              (tokenBalance?.balance ?? 0n) + (ethBalance?.value ?? 0n),
              payToken?.decimals ?? 18,
            )
          : formatUnits(tokenBalance?.balance ?? 0n, payToken?.decimals ?? 18)

      return Number(availableBalance) >= Number(fields.payValue)
    } catch {
      return false
    }
  }, [
    fields.payValue,
    payToken,
    tokenBalance?.balance,
    ethBalance?.value,
    totalWrapping,
    isWrapping,
  ])

  return {
    fields,
    setFields,
    onPayValueChange,
    onReceiveValueChange,
    onMaxClicked,
    handleReverseTokens,
    resetForm,

    // Max tick encountered
    maxTickEncountered,
    setMaxTickEncountered,

    // Slippage
    slippage,
    setSlippage,
    showCustomInput,
    setShowCustomInput,

    // Wrapping
    isWrapping,
    setIsWrapping,
    totalWrapping,

    // Validation
    hasEnoughBalance,
  }
}
