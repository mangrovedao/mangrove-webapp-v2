import type { Address } from "viem"

import { TokenPair } from "@/components/token-pair"
import { useTokenFromAddress } from "@/hooks/use-token-from-address"
import { cn } from "@/utils"

type Props = {
  base: string
  quote: string
  tokenPairClasses?: string
}

export function Market({ base, quote, tokenPairClasses }: Props) {
  const { data: baseToken } = useTokenFromAddress(base as Address)
  const { data: quoteToken } = useTokenFromAddress(quote as Address)

  return (
    <div className="flex items-center space-x-2">
      <TokenPair
        titleProps={{
          variant: "title1",
          className: cn(
            "text-sm text-text-primary font-ubuntu font-normal",
            tokenPairClasses,
          ),
          as: "span",
        }}
        tokenClasses="w-6 h-6"
        baseToken={baseToken}
        quoteToken={quoteToken}
      />
    </div>
  )
}
