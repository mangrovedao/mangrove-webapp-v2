import React, { useMemo } from "react"
import { useAccount, usePublicClient } from "wagmi"

import { useParams } from "next/navigation"

import { useTokenBalance } from "@/hooks/use-balances"
import { formatUnits, parseUnits } from "viem"
import { useMintAmounts } from "../_hooks/use-mint-amounts"
import { useVault } from "../_hooks/use-vault"

export const MIN_NUMBER_OF_OFFERS = 1
export const MIN_STEP_SIZE = 1

export default function useForm() {
  const params = useParams<{ address: string }>()
  const client = usePublicClient()
  const { address } = useAccount()
  const {
    data: { vault },
  } = useVault(params.address)

  const { data, isLoading, isError, setBaseAmount, setQuoteAmount } =
    useMintAmounts({ vault, client })

  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [baseAmount, setBaseSliderAmount] = React.useState("")
  const [quoteAmount, setQuoteSliderAmount] = React.useState("")

  const baseToken = vault?.market.base
  const quoteToken = vault?.market.quote

  const { balance: baseBalance } = useTokenBalance({
    token: baseToken?.address,
  })
  const { balance: quoteBalance } = useTokenBalance({
    token: quoteToken?.address,
  })

  const baseDeposited = formatUnits(
    vault?.userBaseBalance || 0n,
    vault?.market.base.decimals || 18,
  )

  const quoteDeposited = formatUnits(
    vault?.userQuoteBalance || 0n,
    vault?.market.quote.decimals || 18,
  )

  const baseDeposit = useMemo(() => {
    if (data?.side !== "quote") return

    setBaseSliderAmount(formatUnits(data.baseAmount, baseToken?.decimals || 18))
    return formatUnits(data.baseAmount, baseToken?.decimals || 18)
  }, [data.baseAmount, baseToken?.decimals])

  const quoteDeposit = useMemo(() => {
    if (data?.side !== "base") return

    setQuoteSliderAmount(
      formatUnits(data.quoteAmount, quoteToken?.decimals || 18),
    )
    return formatUnits(data.quoteAmount, quoteToken?.decimals || 18)
  }, [data.quoteAmount, quoteToken?.decimals])

  const handleBaseDepositChange = (
    e: React.ChangeEvent<HTMLInputElement> | string,
  ) => {
    const value = typeof e === "string" ? e : e.target.value
    setBaseAmount(parseUnits(value, baseToken?.decimals || 18))
    setBaseSliderAmount(value)
  }

  const handleQuoteDepositChange = (
    e: React.ChangeEvent<HTMLInputElement> | string,
  ) => {
    const value = typeof e === "string" ? e : e.target.value
    setQuoteAmount(parseUnits(value, quoteToken?.decimals || 18))
    setQuoteSliderAmount(value)
  }

  React.useEffect(() => {
    const newErrors = { ...errors }
    // Base Deposit Validation
    if (baseBalance?.balance && data.baseAmount > baseBalance?.balance) {
      newErrors.baseDeposit =
        "Base deposit cannot be greater than wallet balance"
    } else if (Number(baseDeposit) > 0 && Number(baseDeposit) === 0) {
      newErrors.baseDeposit = "Base deposit must be greater than 0"
    } else {
      delete newErrors.baseDeposit
    }

    // Quote Deposit Validation
    if (quoteBalance?.balance && data.quoteAmount > quoteBalance?.balance) {
      newErrors.quoteDeposit =
        "Quote deposit cannot be greater than wallet balance"
    } else if (
      quoteDeposit &&
      Number(quoteDeposit) > 0 &&
      Number(quoteDeposit) === 0
    ) {
      newErrors.quoteDeposit = "Quote deposit must be greater than 0"
    } else {
      delete newErrors.quoteDeposit
    }

    setErrors(newErrors)
  }, [baseDeposit, quoteDeposit])

  return {
    baseDeposited,
    quoteDeposited,
    address,
    baseToken,
    quoteToken,
    baseDeposit: baseAmount,
    quoteDeposit: quoteAmount,
    baseBalance,
    quoteBalance,
    errors,
    handleBaseDepositChange,
    handleQuoteDepositChange,
    isLoading,
    vault,
    mintAmount: data.mintAmount,
    hasErrors: !!Object.keys(errors).length,
  }
}
