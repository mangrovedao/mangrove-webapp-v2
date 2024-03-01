import React from "react"
import { toast } from "sonner"
import { Address, parseEther } from "viem"
import {
  useAccount,
  useBalance,
  useSendTransaction,
  useWaitForTransactionReceipt,
} from "wagmi"

import { tradeService } from "@/app/trade/_services/trade.service"
import Dialog from "@/components/dialogs/dialog"
import { EnhancedNumericInput } from "@/components/token-input"
import { Title } from "@/components/typography/title"
import { Button } from "@/components/ui/button"
import { Close } from "@/svgs"

type Props = {
  isOpen: boolean
  onClose: () => void
}

export default function WrapETHDialog({ isOpen, onClose }: Props) {
  const { chain, address } = useAccount()

  const { data: nativeBalance } = useBalance({
    address,
  })

  const wethAdresses: { [key: number]: string } = {
    168587773: "0x4200000000000000000000000000000000000023",
    81457: "0x4300000000000000000000000000000000000004",
  }

  const { data: hash, isPending, sendTransaction } = useSendTransaction()

  const { isLoading, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const [amount, setAmount] = React.useState("")

  const wrapETH = () => {
    try {
      if (!chain?.id) return

      sendTransaction({
        to: wethAdresses[chain?.id] as Address,
        value: parseEther(amount),
      })
    } catch (error) {
      console.error(error)
      toast.error("Error wrapping ETH")
    }
  }

  React.useEffect(() => {
    if (hash) {
      onClose()
      tradeService.openTxCompletedDialog({
        address: hash as Address,
        blockExplorerUrl: chain?.blockExplorers?.default.url,
      })
      toast.success("ETH wrapped successfully!")
    }
  }, [hash])

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
          <Title>Wrapp your ETH </Title>
          <div className="flex flex-col space-y-2">
            <EnhancedNumericInput
              token={nativeBalance?.symbol}
              label={`Amount to wrap`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={nativeBalance?.formatted === "0"}
              showBalance
            />
          </div>
        </div>
      </Dialog.Description>
      <Dialog.Footer>
        <Button
          className="w-full"
          size={"lg"}
          onClick={wrapETH}
          disabled={isLoading || isPending || !amount}
          loading={isLoading || isPending}
        >
          Wrap ETH
        </Button>
      </Dialog.Footer>
    </Dialog>
  )
}
