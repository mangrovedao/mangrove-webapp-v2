import React from "react"
import { toast } from "sonner"
import { Address, parseUnits } from "viem"
import {
  useAccount,
  useBalance,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi"

import { tradeService } from "@/app/trade/_services/trade.service"
import { EnhancedNumericInput } from "@/components/token-input"
import { Title } from "@/components/typography/title"
import { Button } from "@/components/ui/button"
import wethAbi from "../../../app/faucet/_abis/weth.json"

type Props = {
  isOpen: boolean
  onClose: () => void
}

export const wethAdresses: { [key: number]: Address | undefined } = {
  168587773: "0x4200000000000000000000000000000000000023",
  81457: "0x4300000000000000000000000000000000000004",
  42161: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
}

export default function UnWrap({ isOpen, onClose }: Props) {
  const { chain, address } = useAccount()
  const { data: hash, writeContract, isPending, error } = useWriteContract()
  const { isLoading } = useWaitForTransactionReceipt({
    hash,
  })
  const [amount, setAmount] = React.useState("")
  const [amountError, setAmountError] = React.useState("")

  const { data: wethBalance } = useBalance({
    address,
    token: wethAdresses[chain?.id as number],
  })

  const unWrapETH = () => {
    try {
      if (!chain?.id || !wethBalance) return
      const wethAdress = wethAdresses[chain.id]
      if (!wethAdress) return
      const parsedAmount = parseUnits(amount, wethBalance.decimals)
      writeContract({
        address: wethAdress,
        abi: wethAbi,
        functionName: "withdraw",
        args: [parsedAmount],
      })
    } catch (error) {
      console.error(error)
      toast.error("An error occured while unwrapping wETH.")
    }
  }

  React.useEffect(() => {
    if (hash) {
      tradeService.openTxCompletedDialog({
        address: hash as Address,
        blockExplorerUrl: chain?.blockExplorers?.default.url,
      })
      toast.success("wETH unwrapped successfully!")
    }
  }, [hash])

  React.useEffect(() => {
    if (!amount || !wethBalance?.formatted) return

    if (Number(amount) > Number(wethBalance.formatted)) {
      setAmountError("Insufficient balance")
    } else {
      setAmountError("")
    }
  }, [, wethBalance?.formatted, amount])

  return (
    <div className="flex flex-col space-y-2 bg-bg-secondary rounded-2xl p-5 relative mt-16 max-w-xl mx-auto">
      <Title>Unwrap your wETH </Title>
      <div className="flex flex-col space-y-2">
        <EnhancedNumericInput
          token={wethBalance?.symbol}
          label={`Amount to unwrap`}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={wethBalance?.formatted === "0"}
          customBalance={wethBalance?.formatted}
          showBalance
        />
        {amountError ? (
          <span className="text-red-600">{amountError}</span>
        ) : undefined}
      </div>

      <Button
        className="w-full"
        size={"lg"}
        onClick={unWrapETH}
        disabled={isLoading || isPending || !amount || !!amountError}
        loading={isLoading || isPending}
      >
        Unwrap wETH
      </Button>
    </div>
  )
}
