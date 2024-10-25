import { Skeleton } from "@/components/ui/skeleton"

type Props = {
  value: string
}

export function Value({ value }: Props) {
  if (!value) {
    return <Skeleton className="h-6 w-full" />
  }

  return (
    <div className="flex space-x-3 items-center mx-auto">
      <span className="font-roboto">{value}</span>
    </div>
  )
}

export function ValueLeft({ value }: Props) {
  if (!value) {
    return <Skeleton className="h-6 w-full" />
  }

  return (
    <div className="flex space-x-3 items-center">
      <span className="font-roboto">{value}</span>
    </div>
  )
}
