import Big from "big.js"
import React from "react"
import { useDebounce } from "usehooks-ts"
import { useAccount, useBalance } from "wagmi"

import { useKandelState } from "@/app/strategies/(shared)/_hooks/use-kandel-state"
import { useBook } from "@/hooks/use-book"
import { useTokenBalance } from "@/hooks/use-token-balance"
import useMangrove from "@/providers/mangrove"
import useMarket from "@/providers/market.new"
import { getErrorMessage } from "@/utils/errors"
import { validateKandelParams } from "@mangrovedao/mgv"
import {
  ChangingFrom,
  useNewStratStore,
} from "../../../../new/_stores/new-strat.store"
import useKandel from "../../../_providers/kandel-strategy"
import { useKandelRequirements } from "../../_hooks/use-kandel-requirements"

export const MIN_NUMBER_OF_OFFERS = 1
export const MIN_STEP_SIZE = 1

export default function useForm() {
  const { address } = useAccount()
  const { mangrove } = useMangrove()
  const { currentMarket: market } = useMarket()
  const baseToken = market?.base
  const quoteToken = market?.quote
  const baseBalance = useTokenBalance(baseToken)
  const quoteBalance = useTokenBalance(quoteToken)
  const { data: nativeBalance } = useBalance({
    address,
  })
  const { data: kandelState } = useKandelState()
  const { book } = useBook()
  const logics = mangrove?.getLogicsList().map((item) => {
    if (item.id.includes("simple")) {
      return { ...item, id: "Wallet" }
    } else {
      return item
    }
  })

  const { strategyStatusQuery, mergedOffers, strategyQuery } = useKandel()
  const { currentParameter, offers } = strategyQuery.data ?? {}

  const asksOffers = mergedOffers?.filter((item) => item.offerType === "asks")
  const bidsOffers = mergedOffers?.filter((item) => item.offerType === "bids")

  const baseAmountDeposited = asksOffers?.reduce((acc, curr) => {
    return acc.add(Big(curr.gives ?? 0))
  }, Big(0))

  const quoteAmountDeposited = bidsOffers?.reduce((acc, curr) => {
    return acc.add(Big(curr.gives ?? 0))
  }, Big(0))

  const asks =
    offers
      ?.filter((item) => item.offerType === "asks")
      .map(({ gasbase, gasreq, gasprice }) => ({
        gasbase: Number(gasbase || 0),
        gasreq: Number(gasreq || 0),
        gasprice: Number(gasprice || 0),
      })) || []

  const bids =
    offers
      ?.filter((item) => item.offerType === "bids")
      .map(({ gasbase, gasreq, gasprice }) => ({
        gasbase: Number(gasbase || 0),
        gasreq: Number(gasreq || 0),
        gasprice: Number(gasprice || 0),
      })) || []

  const lockedBounty = kandelState?.unlockedProvision

  React.useEffect(() => {
    if (strategyQuery.data?.offers.some((x) => x.live)) {
      setBaseDeposit(
        baseAmountDeposited?.toFixed(baseToken?.displayDecimals) || "0",
      )
      setQuoteDeposit(
        quoteAmountDeposited?.toFixed(quoteToken?.displayDecimals) || "0",
      )
      setNumberOfOffers(
        (Number(currentParameter?.length) - 1).toString() || "0",
      )
      setStepSize(currentParameter?.stepSize || "0")
      setBountyDeposit(Number(lockedBounty).toFixed(6) || "0")
      // setDistribution()
    }
  }, [strategyQuery.data?.offers, strategyStatusQuery.data?.offerStatuses])

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
    setSendFrom,
    setReceiveTo,
  } = useNewStratStore()

  const debouncedStepSize = useDebounce(stepSize, 300)
  const debouncedNumberOfOffers = useDebounce(numberOfOffers, 300)
  const fieldsDisabled = !(minPrice && maxPrice)

  const kandelRequirementsQuery = useKandelRequirements({
    minPrice,
    maxPrice,
    availableBase: baseDeposit,
    availableQuote: quoteDeposit,
    stepSize: debouncedStepSize,
    numberOfOffers: debouncedNumberOfOffers,
    isChangingFrom,
  })

  const {
    params,
    rawParams,
    minBaseAmount,
    minQuoteAmount,
    minProvision,
    isValid,
  } = validateKandelParams({
    gasreq: 250_000n,
    factor: 3,
    asksLocalConfig: book?.asksConfig!,
    bidsLocalConfig: book?.bidsConfig!,
    minPrice: Number(minPrice),
    maxPrice: Number(maxPrice),
    midPrice: book?.midPrice || 0,
    marketConfig: book?.marketConfig!,
    market: market!,
    baseAmount: BigInt(baseDeposit),
    quoteAmount: BigInt(quoteDeposit),
    stepSize: BigInt(debouncedStepSize),
    pricePoints: BigInt(debouncedNumberOfOffers),
  })

  // const {} = kandelRequirementsQuery.data || {}

  // I need the distribution to be set in the store to share it with the price range component
  React.useEffect(() => {
    setDistribution(params)
  }, [params])

  const setOffersWithPrices = useNewStratStore(
    (store) => store.setOffersWithPrices,
  )

  // if kandelRequirementsQuery has error
  React.useEffect(() => {
    if (kandelRequirementsQuery.error) {
      setGlobalError(getErrorMessage(kandelRequirementsQuery.error))
      return
    }
    setGlobalError(undefined)
  }, [kandelRequirementsQuery.error])

  React.useEffect(() => {
    if (
      isChangingFrom === "numberOfOffers" ||
      !params.pricePoints ||
      Number(numberOfOffers) === Number(params.pricePoints) - 1
    )
      return
    setNumberOfOffers(params.pricePoints.toString())
  }, [params.pricePoints])

  // React.useEffect(() => {
  //   setOffersWithPrices(offersWithPrices)
  // }, [offersWithPrices])

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
    } else if (minBaseAmount > 0 && Number(baseDeposit) === 0) {
      newErrors.baseDeposit = "Base deposit must be greater than 0"
    } else if (
      minBaseAmount > 0 &&
      Number(minBaseAmount) > Number(baseDeposit)
    ) {
      newErrors.baseDeposit = "Base deposit must be updated"
    } else {
      delete newErrors.baseDeposit
    }

    // Quote Deposit Validation
    if (Number(quoteDeposit) > Number(quoteBalance.formatted) && quoteDeposit) {
      newErrors.quoteDeposit =
        "Quote deposit cannot be greater than wallet balance"
    } else if (minQuoteAmount > 0 && Number(quoteDeposit) === 0) {
      newErrors.quoteDeposit = "Quote deposit must be greater than 0"
    } else if (
      minQuoteAmount > 0 &&
      Number(minQuoteAmount) > Number(quoteDeposit)
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

    if (
      Number(bountyDeposit) > Number(nativeBalance?.formatted) &&
      bountyDeposit
    ) {
      newErrors.bountyDeposit =
        "Bounty deposit cannot be greater than wallet balance"
    } else if (minProvision > 0 && Number(bountyDeposit) === 0) {
      newErrors.bountyDeposit = "Bounty deposit must be greater than 0"
    } else if (bountyDeposit && Number(minProvision) > Number(bountyDeposit)) {
      newErrors.bountyDeposit = "Bounty deposit must be updated"
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
    minBaseAmount,
    minQuoteAmount,
    minProvision,
    isChangingFrom,
    numberOfOffers,
    baseDeposit,
    quoteDeposit,
    nativeBalance,
    bountyDeposit,
    fieldsDisabled,
    errors,
    kandelRequirementsQuery,
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
  }
}
