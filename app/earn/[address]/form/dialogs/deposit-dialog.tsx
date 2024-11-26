import type { Token } from "@mangrovedao/mgv"
import React, { useEffect, useMemo } from "react"

import { Vault } from "@/app/earn/(shared)/types"

import { useVaultMintHelper } from "@/app/earn/(shared)/_hooks/use-vaults-addresses"
import Dialog from "@/components/dialogs/dialog-new"
import { TokenPair } from "@/components/token-pair"
import { Text } from "@/components/typography/text"
import { Button, type ButtonProps } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useStep } from "@/hooks/use-step"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { erc20Abi, parseAbi, parseUnits, type Address } from "viem"
import {
  useAccount,
  useReadContracts,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi"
import { ApproveStep } from "../components/approve-step-new"
import { Steps } from "../components/steps"

type Props = {
  vault?: Vault
  baseAmount: string
  quoteAmount: string
  mintAmount: bigint
  baseToken: Token
  quoteToken: Token
  isOpen: boolean
  onClose: () => void
}

const btnProps: ButtonProps = {
  className: "w-full",
  size: "lg",
}

const mintABI = parseAbi([
  "function mint(address vault, uint256 mintAmount, uint256 baseAmountMax, uint256 quoteAmountMax) external returns (uint256 shares, uint256 baseAmount, uint256 quoteAmount)",
])

export default function DepositToVaultDialog({
  isOpen,
  onClose,
  baseAmount: baseAmountRaw,
  quoteAmount: quoteAmountRaw,
  vault,
  quoteToken,
  baseToken,
  mintAmount,
}: Props) {
  const { address, chain } = useAccount()
  const queryClient = useQueryClient()
  const mintHelperAddress = useVaultMintHelper()

  const {
    data,
    isFetched,
    refetch,
    isLoading: isLoadingAllowance,
  } = useReadContracts({
    contracts: [
      {
        address: baseToken.address,
        abi: erc20Abi,
        functionName: "allowance",
        args: [address as Address, mintHelperAddress as Address],
      },
      {
        address: quoteToken.address,
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
      enabled: !!address && !!vault,
    },
  })

  const totalSupply = data?.[2] || 0n

  // amounts with 1% slippage (just in case)
  const baseAmount =
    (parseUnits(baseAmountRaw, baseToken.decimals) *
      (totalSupply === 0n ? 10_000n : 10_100n)) /
    10_000n
  const quoteAmount =
    (parseUnits(quoteAmountRaw, quoteToken.decimals) *
      (totalSupply === 0n ? 10_000n : 10_100n)) /
    10_000n

  const missingBaseAllowance =
    (data?.[0] || 0n) > baseAmount ? 0n : baseAmount - (data?.[0] || 0n)
  const missingQuoteAllowance =
    (data?.[1] || 0n) > quoteAmount ? 0n : quoteAmount - (data?.[1] || 0n)

  const {
    data: hash,
    isPending,
    writeContract,
    reset,
    error,
  } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    })

  const steps = [
    "Summary",
    missingBaseAllowance > 0n && `Approve ${baseToken?.symbol}`,
    missingQuoteAllowance > 0n && `Approve ${quoteToken?.symbol}`,
    "Deposit",
  ].filter(Boolean)
  const [started, setStarted] = React.useState(false)
  const [currentStep, helpers] = useStep(steps.length)
  const { goToNextStep, goToPrevStep, reset: resetStep } = helpers

  // BigInt.prototype.toJSON = function () {
  //   return this.toString()
  // }

  const amount0 = useMemo(() => {
    return baseAmount
  }, [baseAmount, quoteAmount])
  const amount1 = useMemo(() => {
    return quoteAmount
  }, [baseAmount, quoteAmount])

  const result = useSimulateContract({
    address: mintHelperAddress as Address,
    abi: mintABI,
    functionName: "mint",
    args: [vault?.address as Address, mintAmount, amount0, amount1],
  })
  useEffect(() => {
    console.log(error)
    if (!error && isConfirmed && currentStep !== steps.length) {
      reset()
      goToNextStep()
    } else if (isConfirmed && currentStep === steps.length) {
      toast.success(`Assets successfully deposited`)
      queryClient.refetchQueries({
        queryKey: ["vault"],
      })
      queryClient.refetchQueries({
        queryKey: ["user-vaults"],
      })
      onClose()
      setStarted(false)
      resetStep()
    }

    if (error) {
      reset()
      resetStep()
      setStarted(false)
    }
  }, [isConfirmed, error])

  const stepInfos = [
    {
      body: (
        <Summary
          baseAmount={baseAmountRaw}
          quoteAmount={quoteAmountRaw}
          baseToken={baseToken}
          quoteToken={quoteToken}
        />
      ),
      button: (
        <Button
          {...btnProps}
          onClick={() => {
            setStarted(true)
            goToNextStep()
          }}
        >
          Proceed
        </Button>
      ),
    },
    missingBaseAllowance > 0n && {
      body: (
        <div className="text-center">
          <ApproveStep
            tokenSymbol={baseToken?.symbol || ""}
            contractAddress={mintHelperAddress}
            explorerUrl={chain?.blockExplorers?.default.url}
          />
        </div>
      ),
      button: (
        <Button
          {...btnProps}
          disabled={isPending || isConfirming || isLoadingAllowance}
          loading={isPending || isConfirming || isLoadingAllowance}
          onClick={() => {
            try {
              if (!vault) return
              writeContract({
                address: baseToken.address,
                abi: erc20Abi,
                functionName: "approve",
                args: [mintHelperAddress as Address, baseAmount],
              })
            } catch (error) {
              console.error(error)
            }
          }}
        >
          Approve
        </Button>
      ),
    },
    missingQuoteAllowance > 0n && {
      body: (
        <div className="text-center">
          <ApproveStep
            tokenSymbol={quoteToken?.symbol || ""}
            contractAddress={mintHelperAddress}
            explorerUrl={chain?.blockExplorers?.default.url}
          />
        </div>
      ),
      button: (
        <Button
          {...btnProps}
          disabled={isPending || isConfirming || isLoadingAllowance}
          loading={isPending || isConfirming || isLoadingAllowance}
          onClick={() => {
            try {
              if (!vault) return
              writeContract({
                address: quoteToken.address,
                abi: erc20Abi,
                functionName: "approve",
                args: [mintHelperAddress as Address, quoteAmount],
              })
            } catch (error) {
              console.error(error)
            }
          }}
        >
          Approve
        </Button>
      ),
    },
    {
      body: (
        <Summary
          baseAmount={baseAmountRaw}
          quoteAmount={quoteAmountRaw}
          baseToken={baseToken}
          quoteToken={quoteToken}
        />
      ),
      button: (
        <Button
          {...btnProps}
          loading={isPending || isConfirming || result.isLoading}
          disabled={isPending || isConfirming || result.isLoading}
          onClick={() => {
            try {
              if (!vault) return
              writeContract({
                address: mintHelperAddress as Address,
                abi: mintABI,
                functionName: "mint",
                args: [
                  vault.address as Address,
                  parseUnits(baseAmountRaw, baseToken.decimals),
                  parseUnits(quoteAmountRaw, quoteToken.decimals),
                  0n,
                ],
              })
            } catch (error) {
              console.error(error)
            }
          }}
        >
          Deposit
        </Button>
      ),
    },
  ]
    .filter(Boolean)
    .map((stepInfo, i) => {
      return {
        ...stepInfo,
        title: steps[i],
      }
    })

  const isDialogOpenRef = React.useRef(false)
  React.useEffect(() => {
    isDialogOpenRef.current = !!isOpen

    return () => {
      isDialogOpenRef.current = false
    }
  }, [isOpen])

  return (
    <Dialog
      open={!!isOpen}
      onClose={() => {
        onClose()
      }}
      showCloseButton={false}
    >
      <Dialog.Title className="flex end">Deposit to vault</Dialog.Title>
      <Steps steps={steps as string[]} currentStep={currentStep} />
      <Dialog.Description className="p-4 space-y-2">
        <ScrollArea className="h-full" scrollHideDelay={200}>
          <ScrollBar orientation="vertical" className="z-50" />

          {stepInfos[currentStep - 1]?.body ?? undefined}
        </ScrollArea>
      </Dialog.Description>
      <Dialog.Footer>{stepInfos[currentStep - 1]?.button}</Dialog.Footer>
    </Dialog>
  )
}

const SummaryLine = ({
  title,
  value,
}: {
  title?: string
  value?: React.ReactNode
}) => {
  return (
    <div className="flex justify-between text-primary mt-4">
      <Text className="text-muted-foreground">{title}</Text>
      {value}
    </div>
  )
}

const Summary = ({
  baseToken,
  quoteToken,
  nativeBalance,
  quoteAmount,
  baseAmount,
}: {
  baseAmount: string
  quoteAmount: string
  baseToken?: Token
  quoteToken?: Token
  nativeBalance?: string
}) => {
  return (
    <div>
      {/* <Caption className="flex justify-start">You will deposit</Caption>
      <DialogAmountLine
        amount={Number(baseAmount).toFixed(baseToken?.displayDecimals) || "0"}
        estimationAmount={"..."}
        symbol={baseToken?.symbol || ""}
      />

      <DialogAmountLine
        amount={Number(quoteAmount).toFixed(quoteToken?.displayDecimals) || "0"}
        estimationAmount={"..."}
        symbol={quoteToken?.symbol || ""}
      /> */}

      <div className="rounded-lg p-3 border border-border-secondary">
        <TokenPair
          baseToken={baseToken}
          quoteToken={quoteToken}
          tokenClasses="w-[28px] h-[28px]"
        />

        <Separator className="mt-4" />

        <SummaryLine
          title={`${baseToken?.symbol} deposit`}
          value={
            <div className="flex space-x-1 items-center">
              <Text>
                {Number(baseAmount).toFixed(baseToken?.displayDecimals) || 0}
              </Text>
              <Text className="text-muted-foreground">{baseToken?.symbol}</Text>
            </div>
          }
        />

        <SummaryLine
          title={`${quoteToken?.symbol} deposit`}
          value={
            <div className="flex space-x-1 items-center">
              <Text>
                {Number(quoteAmount).toFixed(quoteToken?.displayDecimals) || 0}
              </Text>
              <Text className="text-muted-foreground">
                {quoteToken?.symbol}
              </Text>
            </div>
          }
        />
      </div>
    </div>
  )
}
