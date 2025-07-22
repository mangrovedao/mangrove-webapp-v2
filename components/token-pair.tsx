import type { Token } from "@mangrovedao/mgv"

import { cn } from "@/utils"
import { overrideSymbol } from "@/utils/symbol"
import { TokenIcon } from "./token-icon"
import { Title } from "./typography/title"
import { Skeleton } from "./ui/skeleton"

type Props = {
  baseToken?: Token | null
  quoteToken?: Token | null
  className?: string
  tokenClasses?: string
  titleProps?: React.ComponentProps<typeof Title>
}

export function TokenPair({
  baseToken,
  quoteToken,
  className,
  tokenClasses,
  titleProps,
}: Props) {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <div className="flex -space-x-2 items-center">
        {!baseToken || !quoteToken ? (
          <>
            <Skeleton className={cn(tokenClasses, "rounded-full")} />
            <Skeleton className={cn(tokenClasses, "rounded-full")} />
          </>
        ) : (
          <>
            <TokenIcon
              symbol={baseToken.symbol}
              className={tokenClasses}
              imgClasses="rounded-full"
            />
            <TokenIcon
              symbol={quoteToken.symbol}
              className={tokenClasses}
              imgClasses="rounded-full"
            />
          </>
        )}
      </div>
      {!baseToken || !quoteToken ? (
        <Skeleton className="h-7 w-32" />
      ) : (
        <Title
          {...titleProps}
        >{`${overrideSymbol(baseToken.symbol)}-${overrideSymbol(quoteToken.symbol)}`}</Title>
      )}
    </div>
  )
}
