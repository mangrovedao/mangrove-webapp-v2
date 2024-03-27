import { Caption } from "@/components/typography/caption"
import { Title } from "@/components/typography/title"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/utils"
import { RiskAppetite } from "@/utils/cashness"

export function RiskAppetiteBadge({ value }: { value?: RiskAppetite }) {
  return (
    <div className="flex items-end space-x-2">
      <span className="bg-black-rich rounded-lg p-1">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="25"
          height="24"
          fill="none"
          className={cn({
            "text-cherry-100": value === "high",
            "text-[#FFB800]": value === "medium",
            "text-green-caribbean": value === "low",
            "text-gray-300": !value || value === "-",
          })}
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M5.667 14v3M10 11v6m4.334-9v9m4.333-12v12"
          ></path>
        </svg>
      </span>
      <span className="flex flex-col space-y-2">
        <Caption
          variant={"caption1"}
          className="text-cloud-300 flex items-center"
        >
          Risk appetite
        </Caption>
        {!value ? (
          <Skeleton className="h-7 w-20" />
        ) : (
          <Title variant={"title1"} className="capitalize">
            {value}
          </Title>
        )}
      </span>
    </div>
  )
}
