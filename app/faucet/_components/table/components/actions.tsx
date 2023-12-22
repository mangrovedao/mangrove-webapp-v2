import Link from "next/link"
import { parseUnits, type Address } from "viem"
import {
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi"

import { Button } from "@/components/ui/button"
import { useTokenFromAddress } from "@/hooks/use-token-from-address"

import { toast } from "sonner"
import TestTokenAbi from "../../../_abis/test-token.json"
import { useMintLimit } from "../hooks/use-mint-limit"
import { type FaucetToken } from "../schema"

type Props = {
  faucetToken: FaucetToken
}

export function Actions({ faucetToken }: Props) {
  const isMgv = faucetToken.id.includes("MGV")
  const tokenQuery = useTokenFromAddress(faucetToken.address as Address)
  const mintLimit = useMintLimit(faucetToken.address as Address, !!isMgv)
  const prepareMint = usePrepareContractWrite({
    address: tokenQuery?.data?.address as Address,
    abi: TestTokenAbi,
    functionName: "mint",
    args: [parseUnits(mintLimit.data ?? "", tokenQuery.data?.decimals ?? 0)],
    enabled: !!(
      tokenQuery.data?.decimals &&
      mintLimit.data &&
      faucetToken.id.includes("MGV")
    ),
  })
  const mint = useContractWrite(prepareMint.config)
  const waitForMint = useWaitForTransaction({
    hash: mint.data?.hash,
    onSuccess: () => {
      toast.success("Minted successfully")
    },
    onError: () => {
      toast.error("Error while minting")
    },
  })

  return (
    <div className="flex justify-end w-full">
      {isMgv ? (
        <Button
          size="sm"
          loading={waitForMint.isLoading}
          disabled={
            mintLimit.isLoading ||
            mint.isLoading ||
            tokenQuery.isLoading ||
            waitForMint.isLoading
          }
          onClick={() => {
            mint?.write?.()
          }}
        >
          Faucet
        </Button>
      ) : (
        <Button size="sm" asChild>
          <Link
            href={"https://staging.aave.com/faucet/?marketName=proto_mumbai_v3"}
            target="_blank"
            rel="noreferrer"
          >
            Go to AAVE faucet
          </Link>
        </Button>
      )}
    </div>
  )
}
