import { TokenIcon } from "@/components/token-icon"
import { Caption } from "@/components/typography/caption"
import { Title } from "@/components/typography/title"
import { Skeleton } from "@/components/ui/skeleton"

type Props = {
  symbol?: string
  value?: string
  loading?: boolean
  label: string
}

export default function TotalInventory({
  symbol,
  value,
  loading,
  label,
}: Props) {
  return (
    <div className="flex items-end space-x-2">
      {!loading ? (
        <TokenIcon symbol={symbol} />
      ) : (
        <Skeleton className="w-8 h-8 rounded-full" />
      )}
      <span className="flex flex-col space-y-2">
        <Caption
          variant={"caption1"}
          className="text-cloud-300 flex items-center"
        >
          {label}
        </Caption>
        {!loading ? (
          <Title variant={"title1"}>{value}</Title>
        ) : (
          <Skeleton className="h-6 w-20" />
        )}
      </span>
    </div>
  )
}
