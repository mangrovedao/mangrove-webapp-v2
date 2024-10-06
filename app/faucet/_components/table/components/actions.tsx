import { Token } from "@mangrovedao/mgv"
import Link from "next/link"
import { toast } from "sonner"
import { parseUnits, type Address } from "viem"
import {
  useAccount,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi"
import * as wagmiChains from "wagmi/chains"

import { Button } from "@/components/ui/button-old"
import { useTokenFromAddress } from "@/hooks/use-token-from-address"

import TestTokenAbi from "../../../_abis/test-token.json"
import { useMintLimit } from "../hooks/use-mint-limit"

type Props = {
  faucetToken: Token
}

export function Actions({ faucetToken }: Props) {
  const { chainId } = useAccount()
  const isMgv = faucetToken.mgvTestToken
  const tokenQuery = useTokenFromAddress(faucetToken.address as Address)
  const mintLimit = useMintLimit(faucetToken.address as Address, !!isMgv)
  const { data: prepareMint } = useSimulateContract({
    address: faucetToken.address as Address,
    abi: TestTokenAbi,
    functionName: "mint",
    args: [
      parseUnits(
        mintLimit.data?.toString() ?? "",
        tokenQuery.data?.decimals ?? 0,
      ),
    ],
    query: {
      enabled: !!(tokenQuery.data?.decimals && mintLimit.data && isMgv),
    },
  })

  const { writeContract } = useWriteContract()

  const waitForMint = useWaitForTransactionReceipt({
    hash: prepareMint?.result as unknown as `0x${string}`,
    onReplaced(response) {
      if (response.transactionReceipt) {
        toast.success("Minted successfully")
      } else {
        toast.error("Error while minting")
      }
    },
  })

  return (
    <div className="flex justify-end w-full">
      {isMgv ? (
        <Button
          size="sm"
          loading={waitForMint.isLoading}
          disabled={
            mintLimit.isLoading || tokenQuery.isLoading || waitForMint.isLoading
          }
          onClick={() => writeContract(prepareMint!.request)}
        >
          Faucet
        </Button>
      ) : chainId === wagmiChains.polygonMumbai.id ? (
        <Button size="sm" asChild>
          <Link
            href={"https://staging.aave.com/faucet/?marketName=proto_mumbai_v3"}
            target="_blank"
            rel="noreferrer"
          >
            Go to AAVE faucet
          </Link>
        </Button>
      ) : chainId === wagmiChains.blastSepolia.id ? (
        <Button size="sm" asChild>
          <Link
            href={"https://docs.blast.io/building/guides/weth-yield#testnet-2"}
            target="_blank"
            rel="noreferrer"
          >
            Go to Blast documentation
          </Link>
        </Button>
      ) : undefined}
    </div>
  )
}
