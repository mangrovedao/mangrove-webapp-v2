import React, { useMemo } from "react"
import { useAccount } from "wagmi"

import { useParams, useSearchParams } from "next/navigation"

import { useTokenBalance } from "@/hooks/use-balances"
import { formatUnits, parseUnits } from "viem"
import { useMintAmounts } from "../_hooks/use-mint-amounts"
import { useVault } from "../_hooks/use-vault"

export const MIN_NUMBER_OF_OFFERS = 1
export const MIN_STEP_SIZE = 1
export const vault = {
  address: "0xbC766847aB3b36F7012037f11Cd05B187F51Fc23",
  kandel: "0x2341561eaC01D79e184eaCF09f380EB8A0e3408b",
  market: {
    base: {
      address: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
      symbol: "WETH",
      decimals: 18,
      displayDecimals: 3,
      priceDisplayDecimals: 4,
      mgvTestToken: false,
    },
    quote: {
      address: "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
      symbol: "USDC",
      decimals: 18,
      displayDecimals: 2,
      priceDisplayDecimals: 4,
      mgvTestToken: false,
    },
    tickSpacing: "1" as unknown as bigint,
  },
  strategist: "SKATEFI",
  fees: 0.01,
  totalBase: "20280219438420489" as unknown as bigint,
  totalQuote: "70870059437845227129" as unknown as bigint,
  balanceBase: "0" as unknown as bigint,
  balanceQuote: "0" as unknown as bigint,
  pnl: 0,
  baseIsToken0: false,
}

export default function useForm() {
  const searchParams = useSearchParams()
  const params = useParams<{ address: string }>()

  const {
    data: { vault },
  } = useVault(params.address)

  const { data, isLoading, isError, setBaseAmount, setQuoteAmount } =
    useMintAmounts({ vault: vault })

  const { address } = useAccount()
  // const { currentMarket: market } = useMarket()
  // const baseToken = market?.base
  // const quoteToken = market?.quote

  // const [baseDeposit, setBaseDeposit] = React.useState("")
  // const [quoteDeposit, setQuoteDeposit] = React.useState("")
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  // const baseBalance = useTokenBalance(baseToken)
  // const quoteBalance = useTokenBalance(quoteToken)
  // const { data: nativeBalance } = useBalance({
  //   address,
  // })

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
