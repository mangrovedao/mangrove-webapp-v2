import { TokenIcon } from "@/components/token-icon"

type Props = {
  tokenSymbol: string
}

export function ApproveStep({ tokenSymbol }: Props) {
  return (
    <div className="bg-[#041010] rounded-lg px-4 pt-4 pb-12 space-y-8">
      <div className="flex justify-center items-center">
        <TokenIcon
          className="w-12 h-12 flex justify-center items-center"
          imgClasses="w-12 h-12"
          symbol={tokenSymbol}
        />
      </div>
      <h1 className="text-2xl text-white">
        Allow Mangrove to access your {tokenSymbol}?
      </h1>
      <p className="text-base text-gray-scale-300">
        By granting permission, you are allowing the following contract to
        access your funds.
      </p>
    </div>
  )
}
