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
import Dialog from "@/components/dialogs/dialog"
import { EnhancedNumericInput } from "@/components/token-input"
import { Title } from "@/components/typography/title"
import { Button } from "@/components/ui/button-old"
import { Close } from "@/svgs"
import wethAbi from "../../../app/faucet/_abis/weth.json"
import { wethAdresses } from "./wrap-dialog"

type Props = {
  isOpen: boolean
  onClose: () => void
}

export default function UnWrapETHDialog({ isOpen, onClose }: Props) {
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
      onClose()
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
    <Dialog
      open={!!isOpen}
      onClose={onClose}
      showCloseButton={false}
      type="mangrove"
    >
      <Dialog.Title className="flex justify-center">
        <Dialog.Close className="absolute right-4 top-4">
          <Close />
        </Dialog.Close>
      </Dialog.Title>
      <Dialog.Description>
        <div className="flex flex-col space-y-2">
          <Title>Unwrap your wETH </Title>
          <div className="flex flex-col space-y-2">
            <EnhancedNumericInput
              token={wethBalance?.symbol}
              label={`Amount to Unwrap`}
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
        </div>
      </Dialog.Description>
      <Dialog.Footer>
        <Button
          className="w-full"
          size={"lg"}
          onClick={unWrapETH}
          disabled={isLoading || isPending || !amount || !!amountError}
          loading={isLoading || isPending}
        >
          Unwrap wETH
        </Button>
      </Dialog.Footer>
    </Dialog>
  )
}
