import BoxContainer from "@/app/points/_components/box-container"
import { Caption } from "@/components/typography/caption"
import { Text } from "@/components/typography/text"
import { Title } from "@/components/typography/title"
import { cn } from "@/utils"

const ITEMS: Props[] = [
  {
    stepNumber: 1,
    title: "Spread your link, earn rewards",
    description:
      "Share your unique referral link with your friends to start earning.",
    imgUrl: "/assets/referrals/step-1.webp",
    imgClasses: "absolute left-10 object-contain",
  },
  {
    stepNumber: 2,
    title: "New user",
    description:
      "When a new user accesses our platform using your link and either trades or provides liquidity, they become your referee.",
    imgUrl: "/assets/referrals/step-2.webp",
  },
  {
    stepNumber: 3,
    title: "Share more, Earn more",
    description:
      "Referees receive a 10% increase in their LP + Trading points. You earn this extra 10% as well.",
    imgUrl: "/assets/referrals/step-3.webp",
  },
]

export default function HowItWorks() {
  return (
    <div>
      <Title variant={"title3"} className="text-cloud-300">
        How it works
      </Title>
      <div className="grid grid-cols-3 gap-4 mt-4">
        {ITEMS.map((item) => (
          <Item
            {...item}
            key={item.title}
            className="col-span-full sm:col-span-1"
          />
        ))}
      </div>
    </div>
  )
}

type Props = {
  stepNumber: number
  title: string
  description: string
  imgUrl?: string
  imgClasses?: string
} & React.ComponentProps<typeof BoxContainer>

function Item({
  title,
  description,
  stepNumber,
  imgUrl,
  imgClasses,
  ...props
}: Props) {
  return (
    <BoxContainer
      {...props}
      className={cn(
        props.className,
        "hover:bg-primary-solid-black transition-all flex p-2 flex-col",
      )}
    >
      <div className="h-44 bg-[#010D0D] w-full mb-4 rounded-md relative overflow-clip md:h-32">
        <img
          src={imgUrl}
          alt=""
          className={"w-full h-full object-cover md:object-contain"}
        />
      </div>
      <div className="space-y-2">
        <Caption className="text-green-caribbean text-[10px]">
          Step {stepNumber}
        </Caption>
        <Title variant={"title2"}>{title}</Title>
        <Text variant={"text2"} className="text-cloud-200">
          {description}
        </Text>
      </div>
    </BoxContainer>
  )
}
