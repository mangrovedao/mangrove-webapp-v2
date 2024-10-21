import React, { useMemo } from "react"
import { useAccount } from "wagmi"

import { useParams } from "next/navigation"

import { useTokenBalance } from "@/hooks/use-balances"
import { formatUnits, parseUnits } from "viem"
import { useMintAmounts } from "../_hooks/use-mint-amounts"
import { useVault } from "../_hooks/use-vault"

export const MIN_NUMBER_OF_OFFERS = 1
export const MIN_STEP_SIZE = 1

export default function useForm() {
  const params = useParams<{ address: string }>()
  const {
    data: { vault },
  } = useVault(params.address)

  const { data, isLoading, isError, setBaseAmount, setQuoteAmount } =
    useMintAmounts({ vault })

  const { address } = useAccount()

  const [errors, setErrors] = React.useState<Record<string, string>>({})

  const baseToken = vault?.market.base
  const quoteToken = vault?.market.quote

  const { balance: baseBalance } = useTokenBalance({
    token: baseToken?.address,
  })
  const { balance: quoteBalance } = useTokenBalance({
    token: quoteToken?.address,
  })

  const baseDeposit = useMemo(() => {
    return formatUnits(data.baseAmount, baseToken?.decimals || 18)
  }, [data.baseAmount, baseToken?.decimals])
  const quoteDeposit = useMemo(() => {
    return formatUnits(data.quoteAmount, quoteToken?.decimals || 18)
  }, [data.quoteAmount, quoteToken?.decimals])

  const handleBaseDepositChange = (
    e: React.ChangeEvent<HTMLInputElement> | string,
  ) => {
    const value = typeof e === "string" ? e : e.target.value
    setBaseAmount(parseUnits(value, baseToken?.decimals || 18))
  }

  const handleQuoteDepositChange = (
    e: React.ChangeEvent<HTMLInputElement> | string,
  ) => {
    const value = typeof e === "string" ? e : e.target.value
    setQuoteAmount(parseUnits(value, quoteToken?.decimals || 18))
  }

  React.useEffect(() => {
    const newErrors = { ...errors }

    // Base Deposit Validation
    if (
      baseBalance?.balance &&
      data.baseAmount > baseBalance?.balance &&
      baseDeposit
    ) {
      newErrors.baseDeposit =
        "Base deposit cannot be greater than wallet balance"
    } else if (Number(baseDeposit) > 0 && Number(baseDeposit) === 0) {
      newErrors.baseDeposit = "Base deposit must be greater than 0"
    } else {
      delete newErrors.baseDeposit
    }

    // Quote Deposit Validation
    if (
      quoteBalance?.balance &&
      data.quoteAmount > quoteBalance?.balance &&
      quoteDeposit
    ) {
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
    address,
    baseToken,
    quoteToken,
    baseDeposit,
    quoteDeposit,
    baseBalance,
    quoteBalance,
    errors,
    handleBaseDepositChange,
    handleQuoteDepositChange,
    isLoading,
    vault,
    mintAmount: data.mintAmount,
  }
}
