import type { Token } from "@mangrovedao/mangrove.js"

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
      <div className="flex -space-x-2">
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
          variant={"header1"}
          {...titleProps}
        >{`${baseToken.symbol} / ${quoteToken.symbol}`}</Title>
      )}
    </div>
  )
}
