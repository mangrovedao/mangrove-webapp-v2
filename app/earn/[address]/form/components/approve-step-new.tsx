import { TokenIcon } from "@/components/token-icon"

type Props = {
  tokenSymbol: string
}

export function ApproveStep({ tokenSymbol }: Props) {
  return (
    <div className="border border-border-secondary rounded-lg p-20 space-y-8">
      <div className="flex justify-center items-center">
        <TokenIcon
          className="w-12 h-12 flex justify-center items-center"
          imgClasses="w-12 h-12"
          symbol={tokenSymbol}
        />
      </div>
      <h1 className="text-2xl text-white text-center">
        Allow Mangrove to access your {tokenSymbol}?
      </h1>
      <p className="text-base text-gray-scale-300">
        By granting permission, you are allowing the following contract to
        access your funds.
      </p>
    </div>
  )
}
