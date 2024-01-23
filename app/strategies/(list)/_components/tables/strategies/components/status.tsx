import { Title } from "@/components/typography/title"
import { Check, Close, Closed } from "@/svgs"
import { cn } from "@/utils"

type Status = "active" | "inactive" | "closed"

type Props = {
  status: Status
}

export default function Status({ status }: Props) {
  const Icon =
    status === "active" ? Check : status === "inactive" ? Close : Closed
  return (
    <div
      className={cn("rounded py-0.5 pl-1 pr-2 inline-flex space-x-0.5", {
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
