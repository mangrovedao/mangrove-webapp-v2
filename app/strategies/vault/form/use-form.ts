import React from "react"
import { useAccount, useBalance } from "wagmi"

import { useTokenBalance } from "@/hooks/use-token-balance"

import useMarket from "@/providers/market.new"

export const MIN_NUMBER_OF_OFFERS = 1
export const MIN_STEP_SIZE = 1

export default function useForm() {
  const { address } = useAccount()
  const { currentMarket: market } = useMarket()
  const baseToken = market?.base
  const quoteToken = market?.quote

  const [baseDeposit, setBaseDeposit] = React.useState("")
  const [quoteDeposit, setQuoteDeposit] = React.useState("")
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  const baseBalance = useTokenBalance(baseToken)
  const quoteBalance = useTokenBalance(quoteToken)
  const { data: nativeBalance } = useBalance({
    address,
  })

  const handleBaseDepositChange = (
    e: React.ChangeEvent<HTMLInputElement> | string,
  ) => {
    const value = typeof e === "string" ? e : e.target.value
    setBaseDeposit(value)
  }

  const handleQuoteDepositChange = (
    e: React.ChangeEvent<HTMLInputElement> | string,
  ) => {
    const value = typeof e === "string" ? e : e.target.value
    setQuoteDeposit(value)
  }

  React.useEffect(() => {
    const newErrors = { ...errors }

    // Base Deposit Validation
    if (Number(baseDeposit) > Number(baseBalance.formatted) && baseDeposit) {
      newErrors.baseDeposit =
        "Base deposit cannot be greater than wallet balance"
    } else if (Number(baseDeposit) > 0 && Number(baseDeposit) === 0) {
      newErrors.baseDeposit = "Base deposit must be greater than 0"
    } else {
      delete newErrors.baseDeposit
    }

    // Quote Deposit Validation
    if (Number(quoteDeposit) > Number(quoteBalance.formatted) && quoteDeposit) {
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
    nativeBalance,
    baseBalance,
    quoteBalance,
    errors,
    handleBaseDepositChange,
    handleQuoteDepositChange,
  }
}
