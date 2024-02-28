import InfoTooltip from "@/components/info-tooltip"
import { Caption } from "@/components/typography/caption"
import { Title } from "@/components/typography/title"

export function AverageReturn({ percentage }: { percentage?: number }) {
  const formattedValue = percentage
    ? new Intl.NumberFormat("en-US", {
        style: "percent",
        minimumFractionDigits: 2,
      }).format(percentage / 100)
    : "N/A"
  return (
    <div className="flex items-end space-x-2">
      <span className="bg-black-rich rounded-lg p-1">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="none"
        >
          <path
            stroke="#AACBC4"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M17.25 6.75l-10.5 10.5m1.125-7.5a1.875 1.875 0 100-3.75 1.875 1.875 0 000 3.75zm8.25 8.25a1.875 1.875 0 100-3.75 1.875 1.875 0 000 3.75z"
          ></path>
        </svg>
      </span>
      <span className="flex flex-col space-y-2">
        <Caption
          variant={"caption1"}
          className="text-cloud-300 flex items-center"
        >
          Average return{" "}
          <InfoTooltip>
            <Caption>Average return of the strategy over 30 days.</Caption>
          </InfoTooltip>
        </Caption>
        <Title variant={"title1"}>{formattedValue}</Title>
      </span>
    </div>
  )
}
