"use client"

import React, { useEffect, useMemo } from "react"
import { erc20Abi, formatUnits, parseAbi, parseUnits, type Address } from "viem"

import { useVaultMintHelper } from "@/app/earn/(shared)/_hooks/use-vaults-addresses"
import { EnhancedNumericInput } from "@/components/token-input-new"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useDisclaimerDialog } from "@/stores/disclaimer-dialog.store"
import { cn } from "@/utils"
import { getExactWeiAmount } from "@/utils/regexp"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  useAccount,
  useReadContracts,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi"
import useForm from "./use-form"

export function DepositForm({ className }: { className?: string }) {
  const [baseSliderValue, setBaseSliderValue] = React.useState(0)
  const [quoteSliderValue, setQuoteSliderValue] = React.useState(0)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [txHash, setTxHash] = React.useState<`0x${string}`>("0x")

  const {
    baseToken,
    quoteToken,
    baseDeposit,
    quoteDeposit,
    baseBalance,
    quoteBalance,
    mintParams,
    errors,
    handleBaseDepositChange,
    handleQuoteDepositChange,
    isLoading,
    vault,
    hasErrors,
  } = useForm()

  const { address, chain } = useAccount()
  const queryClient = useQueryClient()
  const { checkAndShowDisclaimer } = useDisclaimerDialog()
  const mintHelperAddress = useVaultMintHelper()

  // Calculate slider percentage from manually entered value
  useEffect(() => {
    if (baseBalance?.balance && baseBalance.balance > 0n && baseDeposit) {
      try {
        const enteredValue = parseFloat(baseDeposit)
        const maxValue = parseFloat(
          formatUnits(baseBalance.balance, baseBalance.token.decimals),
        )
        if (!isNaN(enteredValue) && !isNaN(maxValue) && maxValue > 0) {
          const percentage = Math.min(
            Math.round((enteredValue / maxValue) * 100),
            100,
          )
          setBaseSliderValue(percentage)
        }
      } catch (e) {
        // Handle parsing errors silently
      }
    }
  }, [baseDeposit, baseBalance])

  // Calculate slider percentage from manually entered value
  useEffect(() => {
    if (quoteBalance?.balance && quoteBalance.balance > 0n && quoteDeposit) {
      try {
        const enteredValue = parseFloat(quoteDeposit)
        const maxValue = parseFloat(
          formatUnits(quoteBalance.balance, quoteBalance.token.decimals),
        )
        if (!isNaN(enteredValue) && !isNaN(maxValue) && maxValue > 0) {
          const percentage = Math.min(
            Math.round((enteredValue / maxValue) * 100),
            100,
          )
          setQuoteSliderValue(percentage)
        }
      } catch (e) {
        // Handle parsing errors silently
      }
    }
  }, [quoteDeposit, quoteBalance])

  const handleBaseSliderChange = (value: number) => {
    if (!baseBalance) return
    const amount = (BigInt(value * 100) * baseBalance.balance) / 10_000n

    setBaseSliderValue(value)
    setQuoteSliderValue(0)
    handleBaseDepositChange(formatUnits(amount, baseBalance.token.decimals))
  }

  const handleQuoteSliderChange = (value: number) => {
    if (!quoteBalance) return
    const amount = (BigInt(value * 100) * quoteBalance.balance) / 10_000n

    setQuoteSliderValue(value)
    setBaseSliderValue(0)
    handleQuoteDepositChange(formatUnits(amount, quoteBalance.token.decimals))
  }

  // Custom handler for manual input changes
  const handleBaseInputChange = (
    e: React.ChangeEvent<HTMLInputElement> | string,
  ) => {
    handleBaseDepositChange(e)
    // Slider will be updated by the effect
  }

  // Custom handler for manual input changes
  const handleQuoteInputChange = (
    e: React.ChangeEvent<HTMLInputElement> | string,
  ) => {
    handleQuoteDepositChange(e)
    // Slider will be updated by the effect
  }

  React.useEffect(() => {
    refetchAllowance()
  }, [baseDeposit, quoteDeposit])

  // Get allowances and approval status
  const {
    data: allowanceData,
    isFetched,
    refetch: refetchAllowance,
    isLoading: isLoadingAllowance,
  } = useReadContracts({
    contracts: [
      {
        address: baseToken?.address as Address,
        abi: erc20Abi,
        functionName: "allowance",
        args: [address as Address, mintHelperAddress as Address],
      },
      {
        address: quoteToken?.address as Address,
        abi: erc20Abi,
        functionName: "allowance",
        args: [address as Address, mintHelperAddress as Address],
      },
      {
        address: vault?.address as Address,
        abi: erc20Abi,
        functionName: "totalSupply",
      },
    ],
    allowFailure: false,
    query: {
      enabled: !!address && !!vault && !!baseToken && !!quoteToken,
    },
  })

  const totalSupply = allowanceData?.[2] || 0n

  // amounts with 1% slippage (just in case)
  const baseAmount = baseToken
    ? (parseUnits(baseDeposit || "0", baseToken.decimals) *
        (totalSupply === 0n ? 10_000n : 10_100n)) /
      10_000n
    : 0n

  const quoteAmount = quoteToken
    ? (parseUnits(quoteDeposit || "0", quoteToken.decimals) *
        (totalSupply === 0n ? 10_000n : 10_100n)) /
      10_000n
    : 0n

  console.log({
    baseToken: baseToken?.symbol,
    quoteToken: quoteToken?.symbol,
    baseAmount,
    quoteAmount,
  })

  const baseAllowance = allowanceData?.[0] || 0n
  const quoteAllowance = allowanceData?.[1] || 0n

  const needsBaseApproval = baseAmount > 0n && baseAllowance < baseAmount
  const needsQuoteApproval = quoteAmount > 0n && quoteAllowance < quoteAmount

  const amount0 = useMemo(() => {
    return baseAmount
  }, [baseAmount, quoteAmount])
  const amount1 = useMemo(() => {
    return quoteAmount
  }, [baseAmount, quoteAmount])

  // Write contract hooks
  const {
    data: hash,
    isPending,
    writeContract,
    writeContractAsync,
    reset,
    error,
  } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: txHash,
    })

  // Mint ABI
  const mintABI = parseAbi([
    "function mint(address vault, uint256 mintAmount, uint256 baseAmountMax, uint256 quoteAmountMax) external returns (uint256 shares, uint256 baseAmount, uint256 quoteAmount)",
  ])

  // Simulate mint
  const { data: simulateData } = useSimulateContract({
    address: mintHelperAddress as Address,
    abi: mintABI,
    functionName: "mint",
    args: [
      vault?.address as Address,
      mintParams.mintAmount,
      baseAmount,
      quoteAmount,
    ],
    query: {
      enabled:
        !!vault &&
        mintParams.mintAmount > 0n &&
        baseAmount >= 0n &&
        quoteAmount >= 0n,
    },
  })

  // Effect for transaction completion
  useEffect(() => {
    if (hash) {
      // Set a timeout to clear the loading state if confirmation takes too long
      const timeoutId = setTimeout(() => {
        if (isProcessing) {
          setIsProcessing(false)
          toast.info(
            "Transaction may have completed. Please check your wallet for confirmation.",
          )
          // Always refresh allowances and vault data
          refetchAllowance()
          queryClient.refetchQueries({
            queryKey: ["vault"],
          })
        }
      }, 30000) // 30 seconds timeout

      return () => clearTimeout(timeoutId)
    }
  }, [hash, isProcessing])

  // Effect for handling transaction status
  useEffect(() => {
    if (isConfirmed) {
      reset()
      setIsProcessing(false)

      // Refetch allowances after approval
      if (needsBaseApproval || needsQuoteApproval) {
        refetchAllowance()
        toast.success(
          `Successfully approved ${needsBaseApproval ? baseToken?.symbol : quoteToken?.symbol}`,
        )
      } else {
        // If it was a deposit, show success toast and refetch vault data
        toast.success(`Assets successfully deposited`)
        // Refresh allowances after deposit as well, since allowances may have been used
        refetchAllowance()
        queryClient.refetchQueries({
          queryKey: ["vault"],
        })
        // Reset form values
        handleBaseDepositChange("0")
        handleQuoteDepositChange("0")
      }
    }

    if (error) {
      setIsProcessing(false)
      reset()
    }
  }, [isConfirmed, error])

  // Handle the primary button action
  const handleAction = async () => {
    try {
      if (checkAndShowDisclaimer(address)) return
      setIsProcessing(true)

      if (needsBaseApproval) {
        // Approve base token
        const tx = await writeContractAsync({
          address: baseToken?.address as Address,
          abi: erc20Abi,
          functionName: "approve",
          args: [mintHelperAddress as Address, baseAmount],
        })
        setTxHash(tx)
      } else if (needsQuoteApproval) {
        // Approve quote token
        const tx = await writeContractAsync({
          address: quoteToken?.address as Address,
          abi: erc20Abi,
          functionName: "approve",
          args: [mintHelperAddress as Address, quoteAmount],
        })
        setTxHash(tx)
      } else {
        // All tokens approved, perform deposit

        const tx = await writeContractAsync({
          address: mintHelperAddress as Address,
          abi: mintABI,
          functionName: "mint",
          args: [
            vault?.address as Address,
            parseUnits(baseDeposit, baseToken?.decimals || 18),
            parseUnits(quoteDeposit, quoteToken?.decimals || 18),
            0n,
          ],
        })
        setTxHash(tx)
      }
    } catch (error) {
      console.error(error)
      setIsProcessing(false)
    }
  }

  // Determine button label
  const getButtonLabel = () => {
    if (needsBaseApproval) return `Approve ${baseToken?.symbol}`
    if (needsQuoteApproval) return `Approve ${quoteToken?.symbol}`
    return "Deposit"
  }

  if (!baseToken || !quoteToken)
    return (
      <div className={"p-0.5"}>
        <Skeleton className="w-full h-full" />
      </div>
    )

  console.log(isPending, isProcessing)

  return (
    <form
      className={cn("flex flex-col h-full", className)}
      onSubmit={(e) => {
        e.preventDefault()
      }}
    >
      <div className="flex-grow space-y-6">
        <EnhancedNumericInput
          sendSliderValue={baseSliderValue}
          setSendSliderValue={handleBaseSliderChange}
          token={baseToken}
          disabled={
            (vault?.totalBase === 0n && vault?.totalQuote !== 0n) ||
            baseBalance?.balance === 0n ||
            isProcessing
          }
          dollarAmount={
            (Number(baseDeposit) * (vault?.baseDollarPrice || 0)).toFixed(3) ||
            "..."
          }
          label={`Deposit ${baseSliderValue}%`}
          inputClassName="bg-bg-primary"
          value={getExactWeiAmount(baseDeposit, baseToken.priceDisplayDecimals)}
          onChange={handleBaseInputChange}
          error={errors.baseDeposit}
          showBalance
          balanceAction={{ onClick: handleBaseDepositChange, text: "MAX" }}
        />

        <EnhancedNumericInput
          sendSliderValue={quoteSliderValue}
          setSendSliderValue={handleQuoteSliderChange}
          token={quoteToken}
          disabled={
            (vault?.totalQuote === 0n && vault?.totalBase !== 0n) ||
            quoteBalance?.balance === 0n ||
            isProcessing
          }
          dollarAmount={
            (Number(quoteDeposit) * (vault?.quoteDollarPrice || 0)).toFixed(
              3,
            ) || "..."
          }
          label={`Deposit ${quoteSliderValue}%`}
          value={getExactWeiAmount(
            quoteDeposit,
            quoteToken.priceDisplayDecimals,
          )}
          inputClassName="bg-bg-primary"
          onChange={handleQuoteInputChange}
          error={errors.quoteDeposit}
          showBalance
          balanceAction={{ onClick: handleQuoteDepositChange, text: "MAX" }}
        />
      </div>

      <div className="mt-auto pt-4">
        <div className="flex gap-2 items-center">
          <Button
            className="w-full hover:hover:bg-bg-tertiary bg-bg-primary"
            onClick={handleAction}
            disabled={
              isLoading ||
              isLoadingAllowance ||
              mintParams.mintAmount === 0n ||
              hasErrors ||
              isPending ||
              isProcessing
            }
            loading={isPending || isProcessing}
          >
            {getButtonLabel()}
          </Button>
        </div>
      </div>
    </form>
  )
}
