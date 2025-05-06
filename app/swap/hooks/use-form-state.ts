import React from "react"
import { formatUnits } from "viem"
import { useBalance } from "wagmi"

import { getExactWeiAmount } from "@/utils/regexp"
import { type Token } from "@mangrovedao/mgv"
import { SLIPPAGES } from "./use-swap"

export function useFormState({
  payToken,
  receiveToken,
  payTokenBalance,
  reverseTokens,
}: {
  payToken?: Token
  receiveToken?: Token
  payTokenBalance: { balance: bigint | undefined }
  reverseTokens: () => void
}) {
  const { data: ethBalance } = useBalance()
  const [fields, setFields] = React.useState({
    payValue: "",
    receiveValue: "",
  })
  const [showCustomInput, setShowCustomInput] = React.useState(false)
  const [slippage, setSlippage] = React.useState(SLIPPAGES[1])
  const [isWrapping, setIsWrapping] = React.useState(false)

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
      payTokenBalance.balance ?? 0n,
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

  function resetFields() {
    setFields({
      payValue: "",
      receiveValue: "",
    })
  }

  function updateReceiveValue(receiveValue: string) {
    setFields((fields) => ({
      ...fields,
      receiveValue: getExactWeiAmount(
        receiveValue ?? "",
        receiveToken?.decimals ?? 18,
      ),
    }))
  }

  function reverseFieldValues() {
    setFields((fields) => ({
      payValue: fields.receiveValue,
      receiveValue: fields.payValue,
    }))
    reverseTokens()
  }

  const totalWrapping = React.useMemo(() => {
    if (!fields.payValue || !payToken) return 0

    const payTokenBalanceFormatted = Number(
      formatUnits(payTokenBalance.balance || 0n, payToken.decimals ?? 18),
    )
    const payValueNum = Number(fields.payValue)

    if (payValueNum <= payTokenBalanceFormatted) return 0

    return payValueNum - payTokenBalanceFormatted
  }, [fields.payValue, payToken, payTokenBalance.balance, ethBalance?.value])

  const hasEnoughBalance = React.useMemo(() => {
    if (!fields.payValue || !payToken) return false

    try {
      const availableBalance =
        isWrapping && totalWrapping > 0
          ? formatUnits(
              (payTokenBalance.balance ?? 0n) + (ethBalance?.value ?? 0n),
              payToken?.decimals ?? 18,
            )
          : formatUnits(payTokenBalance.balance ?? 0n, payToken?.decimals ?? 18)

      return Number(availableBalance) >= Number(fields.payValue)
    } catch {
      return false
    }
  }, [
    fields.payValue,
    payToken,
    payTokenBalance.balance,
    ethBalance?.value,
    totalWrapping,
    isWrapping,
  ])

  return {
    fields,
    setFields,
    slippage,
    setSlippage,
    showCustomInput,
    setShowCustomInput,
    isWrapping,
    setIsWrapping,
    onPayValueChange,
    onReceiveValueChange,
    onMaxClicked,
    resetFields,
    updateReceiveValue,
    reverseFieldValues,
    totalWrapping,
    hasEnoughBalance,
    ethBalance,
  }
}
