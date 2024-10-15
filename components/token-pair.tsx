import type { Token } from "@mangrovedao/mgv"

import { cn } from "@/utils"
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
            <TokenIcon symbol={baseToken.symbol} className={tokenClasses} />
            <TokenIcon symbol={quoteToken.symbol} className={tokenClasses} />
          </>
        )}
      </div>
      {!baseToken || !quoteToken ? (
        <Skeleton className="h-7 w-32" />
      ) : (
        <Title
          {...titleProps}
        >{`${baseToken.symbol}-${quoteToken.symbol}`}</Title>
      )}
    </div>
  )
}
