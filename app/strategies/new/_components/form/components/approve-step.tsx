import { TokenIcon } from "@/components/token-icon"
import { TokenPair } from "@/components/token-pair"
import { Token } from "@mangrovedao/mgv"

type Props = {
  baseToken?: Token
  baseDeposit?: string
  quoteToken?: Token
  quoteDeposit?: string
  contractAddress?: string
  explorerUrl?: string
}

export function ApproveStep({
  baseToken,
  baseDeposit,
  quoteToken,
  quoteDeposit,
  contractAddress,
  explorerUrl,
}: Props) {
  const isFullySided = Number(baseDeposit) > 0 && Number(quoteDeposit) > 0
  const isOnlyBase = Number(baseDeposit) > 0

  const tokens = isFullySided
    ? `${baseToken?.symbol}/${quoteToken?.symbol}`
    : isOnlyBase
      ? baseToken?.symbol
      : quoteToken?.symbol

  return (
    <div className="bg-[#041010] rounded-lg px-4 pt-4 pb-12 space-y-8">
      <div className="flex justify-center items-center">
        {isFullySided ? (
          <TokenPair
            baseToken={baseToken}
            quoteToken={quoteToken}
            tokenClasses="w-[28px] h-[28px]"
          />
        ) : (
          <TokenIcon
            className="w-12 h-12 flex justify-center items-center"
            imgClasses="w-12 h-12"
            symbol={isOnlyBase ? baseToken?.symbol : quoteToken?.symbol}
          />
        )}
      </div>
      <h1 className="text-2xl text-white">
        Allow Mangrove to access your {tokens}?
      </h1>
      <p className="text-base text-gray-scale-300">
        By granting permission, you are allowing{" "}
        <a
          href={`${explorerUrl}/address/${contractAddress}`}
          target="_blank"
          className="text-text-brand"
        >
          this contract
        </a>{" "}
        to access your funds.
      </p>
    </div>
  )
}
