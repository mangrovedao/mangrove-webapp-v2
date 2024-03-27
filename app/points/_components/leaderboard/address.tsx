import Link from "next/link"
import { useAccount } from "wagmi"

import { shortenAddress } from "@/utils/wallet"

export default function Address({ address }: { address: string }) {
  const { address: userAddress } = useAccount()
  const { chain } = useAccount()
  const blockExplorerUrl = chain?.blockExplorers?.default.url
  const shortenedAddress = shortenAddress(address)
  return (
    <Link
      href={`${blockExplorerUrl}/address/${address}`}
      target="_blank"
      rel="noreferrer"
      className="flex space-x-2 items-center underline"
    >
      {shortenedAddress}
      {userAddress === address ? (
        <span className="ml-2 text-white bg-green-bangladesh px-2 py-1 rounded-sm text-sm font-roboto">
          you
        </span>
      ) : undefined}
    </Link>
  )
}
