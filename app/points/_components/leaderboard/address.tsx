import { useAccount } from "wagmi"

import { shortenAddress } from "@/utils/wallet"

export default function Address({ address }: { address: string }) {
  const { address: userAddress } = useAccount()
  const shortenedAddress = shortenAddress(address)
  return (
    <div>
      {shortenedAddress}
      {userAddress === address ? (
        <span className="ml-2 text-white bg-green-bangladesh px-2 py-1 rounded-sm text-sm">
          you
        </span>
      ) : undefined}
    </div>
  )
}
