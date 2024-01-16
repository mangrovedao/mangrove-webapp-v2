import { TokenPair } from "@/components/token-pair"
import { Token } from "@mangrovedao/mangrove.js"

type Props = {
  baseToken?: Token
  quoteToken?: Token
}

export function ApproveStep({ baseToken, quoteToken }: Props) {
  return (
    <div className="bg-[#041010] rounded-lg px-4 pt-4 pb-12 space-y-8">
      <div className="flex justify-center items-center">
        <TokenPair
          baseToken={baseToken}
          quoteToken={quoteToken}
          tokenClasses="w-[28px] h-[28px]"
        />
        {/* <TokenIcon
          className="w-12 h-12 flex justify-center items-center"
          imgClasses="w-12 h-12"
          symbol={tokenSymbol}
        /> */}
      </div>
      <h1 className="text-2xl text-white">
        Allow Mangrove to access your {baseToken?.symbol}/{quoteToken?.symbol}?
      </h1>
      <p className="text-base text-gray-scale-300">
        By granting permission, you are allowing the following contract to
        access your funds.
      </p>
    </div>
  )
}
