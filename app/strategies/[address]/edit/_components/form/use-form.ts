import { Logic } from "@mangrovedao/mgv"
import { getKandelGasReq } from "@mangrovedao/mgv/lib"
import React from "react"
import { useDebounce } from "usehooks-ts"
import { formatUnits, parseUnits } from "viem"
import { useAccount, useBalance } from "wagmi"

import { useLogics } from "@/hooks/use-addresses"
import { useTokenBalance } from "@/hooks/use-token-balance"
import { getErrorMessage } from "@/utils/errors"
import {
  ChangingFrom,
  useNewStratStore,
} from "../../../../new/_stores/new-strat.store"
import { useValidateKandel } from "../../../_hooks/use-kandel-validator"
import useKandel from "../../../_providers/kandel-strategy"

export const MIN_NUMBER_OF_OFFERS = 1
export const MIN_STEP_SIZE = 1

export default function useForm() {
  const { address } = useAccount()
  const {
    strategyStatusQuery,
    strategyQuery,
    baseToken,
    quoteToken,
    kandelState,
  } = useKandel()

  const baseBalance = useTokenBalance(baseToken)
  const quoteBalance = useTokenBalance(quoteToken)
  const { data: nativeBalance } = useBalance({
    address,
  })

  const logics = useLogics()
  const { currentParameter } = strategyQuery.data ?? {}

  const lockedBounty = formatUnits(kandelState?.totalProvision || 0n, 18)

  const {
    priceRange: [minPrice, maxPrice],
    setGlobalError,
    errors,
    setErrors,
    baseDeposit,
    quoteDeposit,
    numberOfOffers,
    stepSize,
    bountyDeposit,
    isChangingFrom,
    sendFrom,
    receiveTo,
    setBaseDeposit,
    setQuoteDeposit,
    setNumberOfOffers,
    setStepSize,
    setBountyDeposit,
    setIsChangingFrom,
    setDistribution,
    setKandelParams,
    setSendFrom,
    setReceiveTo,
  } = useNewStratStore()

  React.useEffect(() => {
    if (
      strategyQuery.data?.offers.some((x) => x.live) &&
      strategyStatusQuery.isFetched
    ) {
      //   getCurrentLiquiditySourcing()
      setBaseDeposit(
        formatUnits(kandelState?.baseAmount || 0n, baseToken?.decimals || 18),
      )
      setQuoteDeposit(
        formatUnits(kandelState?.quoteAmount || 0n, quoteToken?.decimals || 18),
      )
      setNumberOfOffers(
        (Number(currentParameter?.length) - 1).toString() || "10",
      )
      setStepSize(currentParameter?.stepSize || "")
      setBountyDeposit(lockedBounty)
    }
  }, [strategyQuery.data?.offers, strategyStatusQuery.data?.offerStatuses])

  const debouncedStepSize = useDebounce(stepSize, 300)
  const debouncedNumberOfOffers = useDebounce(numberOfOffers, 300)
  const fieldsDisabled = !(minPrice && maxPrice)
  const baseLogic = logics.find((logic) => logic.name === sendFrom)
  const quoteLogic = logics.find((logic) => logic.name === receiveTo)

  const gasreq = getKandelGasReq({
    baseLogic: baseLogic as Logic,
    quoteLogic: quoteLogic as Logic,
  })

  const isMissingField = !minPrice || !maxPrice || !baseDeposit || !quoteDeposit

  const { data } = useValidateKandel(
    {
      gasreq,
      factor: 3,
      minPrice: Number(minPrice),
      maxPrice: Number(maxPrice),
      baseAmount: parseUnits(baseDeposit, baseToken?.decimals || 18),
      quoteAmount: parseUnits(quoteDeposit, quoteToken?.decimals || 18),
      stepSize: BigInt(debouncedStepSize),
      pricePoints: BigInt(Number(debouncedNumberOfOffers) + 1),
    },
    isMissingField,
  )

  const {
    params,
    distribution,
    minBaseAmount,
    minQuoteAmount,
    minProvision,
    isValid,
  } = data ?? {}

  const minBase = formatUnits(minBaseAmount || 0n, baseToken?.decimals || 18)
  const minQuote = formatUnits(minQuoteAmount || 0n, quoteToken?.decimals || 18)
  const minProv = formatUnits(minProvision || 0n, quoteToken?.decimals || 18)

  // I need the distribution to be set in the store to share it with the price range component
  React.useEffect(() => {
    setKandelParams(params)
  }, [params])

  React.useEffect(() => {
    setDistribution(distribution)
  }, [distribution])

  React.useEffect(() => {
    if (isMissingField) return
    if (!isValid) {
      setGlobalError(
        getErrorMessage("An error occured, please verify your kandel params"),
      )
      return
    }
    setGlobalError(undefined)
  }, [isValid, isMissingField])

  React.useEffect(() => {
    if (
      isChangingFrom === "numberOfOffers" ||
      !params?.pricePoints ||
      Number(numberOfOffers) === Number(params?.pricePoints) - 1
    )
      return
    setNumberOfOffers(params?.pricePoints.toString())
  }, [params?.pricePoints])

  const handleFieldChange = (field: ChangingFrom) => {
    setIsChangingFrom(field)
  }

  const handleBaseDepositChange = (
    e: React.ChangeEvent<HTMLInputElement> | string,
  ) => {
    handleFieldChange("baseDeposit")
    const value = typeof e === "string" ? e : e.target.value
    setBaseDeposit(value)
  }

  const handleSendFromChange = (
    e: React.ChangeEvent<HTMLInputElement> | string,
  ) => {
    handleFieldChange("sendFrom")
    const value = typeof e === "string" ? e : e.target.value
    setSendFrom(value)
  }

  const handleReceiveToChange = (
    e: React.ChangeEvent<HTMLInputElement> | string,
  ) => {
    handleFieldChange("receiveTo")
    const value = typeof e === "string" ? e : e.target.value
    setReceiveTo(value)
  }

  const handleQuoteDepositChange = (
    e: React.ChangeEvent<HTMLInputElement> | string,
  ) => {
    handleFieldChange("quoteDeposit")
    const value = typeof e === "string" ? e : e.target.value
    setQuoteDeposit(value)
  }

  const handleNumberOfOffersChange = (
    e: React.ChangeEvent<HTMLInputElement> | string,
  ) => {
    handleFieldChange("numberOfOffers")
    const value = typeof e === "string" ? e : e.target.value
    setNumberOfOffers(value)
  }

  const handleStepSizeChange = (
    e: React.ChangeEvent<HTMLInputElement> | string,
  ) => {
    handleFieldChange("stepSize")
    const value = typeof e === "string" ? e : e.target.value
    setStepSize(value)
  }

  const handleBountyDepositChange = (
    e: React.ChangeEvent<HTMLInputElement> | string,
  ) => {
    handleFieldChange("bountyDeposit")
    const value = typeof e === "string" ? e : e.target.value
    setBountyDeposit(value)
  }

  React.useEffect(() => {
    const newErrors = { ...errors }

    // Base Deposit Validation
    if (Number(baseDeposit) > Number(baseBalance.formatted) && baseDeposit) {
      newErrors.baseDeposit =
        "Base deposit cannot be greater than wallet balance"
    } else if (Number(minBase) > 0 && Number(baseDeposit) === 0) {
      newErrors.baseDeposit = "Base deposit must be greater than 0"
    } else if (Number(minBase) > 0 && Number(minBase) > Number(baseDeposit)) {
      newErrors.baseDeposit = "Base deposit must be updated"
    } else {
      delete newErrors.baseDeposit
    }

    // Quote Deposit Validation
    if (Number(quoteDeposit) > Number(quoteBalance.formatted) && quoteDeposit) {
      newErrors.quoteDeposit =
        "Quote deposit cannot be greater than wallet balance"
    } else if (minQuote && Number(minQuote) > 0 && Number(quoteDeposit) === 0) {
      newErrors.quoteDeposit = "Quote deposit must be greater than 0"
    } else if (
      minQuote &&
      Number(minQuote) > 0 &&
      Number(minQuote) > Number(quoteDeposit)
    ) {
      newErrors.quoteDeposit = "Quote deposit must updated"
    } else {
      delete newErrors.quoteDeposit
    }

    if (
      Number(numberOfOffers) < Number(MIN_NUMBER_OF_OFFERS) &&
      numberOfOffers
    ) {
      newErrors.numberOfOffers = "Number of offers must be at least 1"
    } else {
      delete newErrors.numberOfOffers
    }

    if (
      (Number(stepSize) < Number(MIN_STEP_SIZE) ||
        Number(stepSize) >= Number(numberOfOffers) + 1) &&
      stepSize
    ) {
      newErrors.stepSize =
        "Step size must be at least 1 and inferior or equal to number of offers"
    } else {
      delete newErrors.stepSize
    }

    if (Number(bountyDeposit) > Number(nativeBalance?.value) && bountyDeposit) {
      newErrors.bountyDeposit =
        "Bounty deposit cannot be greater than wallet balance"
    } else if (minProv && Number(minProv) > 0 && Number(bountyDeposit) === 0) {
      newErrors.bountyDeposit = "Bounty deposit must be greater than 0"
    } else if (
      minProv &&
      Number(minProv) > 0 &&
      Number(minProv) > Number(bountyDeposit)
    ) {
      newErrors.bountyDeposit = "Bounty deposit must be greater than 0"
    } else {
      delete newErrors.bountyDeposit
    }
    setErrors(newErrors)
  }, [
    baseDeposit,
    quoteDeposit,
    numberOfOffers,
    stepSize,
    bountyDeposit,
    minBaseAmount,
    minQuoteAmount,
  ])

  return {
    baseToken,
    quoteToken,
    minBaseAmount: minBase,
    minQuoteAmount: minQuote,
    minProvision: minProv,
    isChangingFrom,
    numberOfOffers,
    baseDeposit,
    quoteDeposit,
    nativeBalance,
    bountyDeposit,
    fieldsDisabled,
    errors,
    isValid,
    stepSize,
    sendFrom,
    receiveTo,
    logics,
    handleBaseDepositChange,
    handleQuoteDepositChange,
    handleNumberOfOffersChange,
    handleSendFromChange,
    handleReceiveToChange,
    handleStepSizeChange,
    handleBountyDepositChange,
    // getCurrentLiquiditySourcing,
  }
}
