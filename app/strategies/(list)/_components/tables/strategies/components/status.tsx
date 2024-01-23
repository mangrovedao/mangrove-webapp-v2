import { Strategy } from "@/app/strategies/(list)/_schemas/kandels"
import { Title } from "@/components/typography/title"
import { Skeleton } from "@/components/ui/skeleton"
import { Check, Close, Closed } from "@/svgs"
import { cn } from "@/utils"
import useStrategyStatus from "../hooks/use-strategy-status"

type Props = {
  strategy: Strategy
}

export default function Status({ strategy }: Props) {
  const { data } = useStrategyStatus(strategy)
  const status = data?.status

  if (!status) return <Skeleton className="w-20 h-5" />

  const Icon =
    status === "active" ? Check : status === "inactive" ? Close : Closed
  return (
    <div
      className={cn("rounded py-0.5 pl-1 pr-2 inline-flex space-x-0.5", {
        hidden: !status,
        "bg-primary-dark-green text-green-caribbean": status === "active",
        "bg-cherry-400 text-cherry-100": status === "inactive",
        "bg-cloud-500 text-cloud-00": status === "closed",
      })}
    >
      <Icon className="w-5 h-auto" />
      <Title variant={"title3"} className="text-inherit capitalize">
        {status}
      </Title>
    </div>
  )
}
