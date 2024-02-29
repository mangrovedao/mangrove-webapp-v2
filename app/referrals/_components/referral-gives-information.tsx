import BoxContainer from "@/app/points/_components/box-container"
import { Title } from "@/components/typography/title"
import { Check } from "@/svgs"
import { cn } from "@/utils"

export default function ReferralGivesInformation() {
  return (
    <div>
      <Title variant={"title3"} className="text-cloud-300">
        Each successful referral gives
      </Title>
      <div className="grid grid-cols-2 gap-4 mt-4">
        <Item
          badgeLabel="For you"
          percentage="10%"
          description="worth of their LP + Trading points"
          className="col-span-full md:col-span-1"
        />
        <Item
          badgeLabel="For them"
          percentage="10%"
          description="increase in their LP + Trading points"
          className="col-span-full md:col-span-1"
        />
      </div>
    </div>
  )
}

type Props = {
  badgeLabel: string
  percentage: string
  description: string
} & React.ComponentProps<typeof BoxContainer>

function Item({ badgeLabel, percentage, description, ...props }: Props) {
  return (
    <BoxContainer
      {...props}
      className={cn(
        props.className,
        "hover:bg-primary-solid-black transition-all flex",
      )}
    >
      <span className="flex-1">
        <Badge label={badgeLabel} />
      </span>
      <div className="flex items-center space-x-4 flex-1">
        <span className="font-axiforma text-4xl">{percentage}</span>
        <span className="text-sm line-clamp-3">{description}</span>
      </div>
    </BoxContainer>
  )
}

function Badge({ label }: { label: string }) {
  return (
    <div
      className={
        "rounded py-0.5 pl-1 pr-2 inline-flex whitespace-nowrap space-x-0.5 bg-primary-dark-green text-green-caribbean items-center"
      }
    >
      <Check className="w-5 h-auto" />
      <Title variant={"title3"} className="text-inherit">
        {label}
      </Title>
    </div>
  )
}
