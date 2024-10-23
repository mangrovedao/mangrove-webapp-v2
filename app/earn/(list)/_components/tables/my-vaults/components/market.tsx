import type { Address } from "viem"

import { TokenPair } from "@/components/token-pair"
import { useTokenFromAddress } from "@/hooks/use-token-from-address"

type Props = {
  base: string
  quote: string
}

export function Market({ base, quote }: Props) {
  const { data: baseToken } = useTokenFromAddress(base as Address)
  const { data: quoteToken } = useTokenFromAddress(quote as Address)

  return (
    <div className="flex items-center space-x-2">
      <TokenPair
        titleProps={{
          variant: "title3",
          className: "text-sm text-text-primary font-ubuntuLight",
          as: "span",
          weight: "bold",
        }}
        tokenClasses="w-6 h-6"
        baseToken={baseToken}
        quoteToken={quoteToken}
      />
    </div>
  )
}
