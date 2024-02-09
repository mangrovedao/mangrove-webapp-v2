import InfoTooltip from "@/components/info-tooltip"
import { Text } from "@/components/typography/text"
import { Title } from "@/components/typography/title"
import { cn } from "@/utils"
import Animals from "./animals"
import BoxContainer from "./box-container"

type Props = {
  className?: string
}

const LEVELS = [
  {
    amount: "$1,000",
    nextBoost: "2%",
  },
  {
    amount: "$10,000",
    nextBoost: "15%",
  },
  {
    amount: "$50,000",
    nextBoost: "7%",
  },
  {
    amount: "$100,000",
    nextBoost: "10%",
  },
  {
    amount: "$500,000",
    nextBoost: "15%",
  },
]

export default function NextLevel({ className }: Props) {
  const currentLevel = 1
  return (
    <BoxContainer className={cn(className)}>
      <div className="flex justify-between">
        <Title className="flex items-center">
          Next level{" "}
          <InfoTooltip>
            Boosts are tied to your level, which <br /> is revised every 7 days
            based on <br /> your weekly trading volume.
          </InfoTooltip>
        </Title>
        <div className="text-base text-cloud-200 flex items-center">
          4d 12h 36m 15s{" "}
          <InfoTooltip>Time until your level is updated.</InfoTooltip>
        </div>
      </div>
      <div className="w-full aspect-[5.266] relative mt-20 grid grid-cols-5 border-x border-green-bangladesh">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 891 112"
          className="absolute bottom-0 left-0 mt-4 z-0"
        >
          <path
            fill="url(#a)"
            d="M891 112H0C326.815 92.855 601.339 80.41 891 0v112z"
          ></path>
          <defs>
            <linearGradient
              id="a"
              x1="891"
              x2="0"
              y1="0"
              y2="0"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#00DF81"></stop>
              <stop offset="0.515" stopColor="#03624C"></stop>
              <stop offset="1" stopColor="#031F1E"></stop>
            </linearGradient>
          </defs>
        </svg>

        {new Array(5).fill(" ").map((_, i) => (
          <div
            className={cn(
              "col-span-1 h-full z-10 first-of-type:border-l-none",
              "relative group",
              {
                "bg-level-chart": i === currentLevel,
              },
            )}
          >
            <Animals
              className={cn("z-30 absolute", {
                visible: i === currentLevel,
                hidden: i !== currentLevel,
              })}
              level={currentLevel}
            />
            <div
              className={cn(
                "w-2 h-full bg-primary-bush-green right-0 absolute group-last-of-type:opacity-0",
                "border-l border-green-bangladesh",
              )}
            ></div>
            <span
              className={cn(
                "absolute -top-8 group-first-of-type:-left-1 -left-3 text-xs",
                {
                  "bg-green-bangladesh px-2 aspect-square rounded-full text-white flex items-center -left-4 -translate-y-1":
                    i === currentLevel + 1,
                },
              )}
            >
              {i}
            </span>
            {i === 4 ? (
              <span
                className={cn("absolute -right-1 -top-8 text-xs", {
                  "bg-green-bangladesh px-2 aspect-square rounded-full text-white flex items-center justify-center -right-3 w-5 h-5":
                    //@ts-ignore
                    currentLevel === 4,
                })}
              >
                {i + 1}
              </span>
            ) : undefined}
          </div>
        ))}
      </div>
      <div className="mt-4 text-xs grid grid-cols-5">
        {LEVELS.map((level, i) => (
          <div
            key={level.amount}
            className={cn(
              "col-span-1 text-right pr-2 flex items-center justify-end",
              {
                "md:justify-between": i === 0,
              },
            )}
          >
            {i === 0 && (
              <Text
                variant={"text2"}
                className="text-cloud-200 items-center hidden md:flex"
              >
                Volume
                <InfoTooltip>
                  Reflects your trading volume and the volume produced by your
                  liquidity.
                </InfoTooltip>
              </Text>
            )}
            <span>{level.amount}</span>
          </div>
        ))}
        {LEVELS.map((level, i) => (
          <div
            key={level.nextBoost}
            className={cn(
              "col-span-1 text-right pr-2 flex items-center justify-end",
              {
                "md:justify-between": i === 0,
              },
            )}
          >
            {i === 0 && (
              <Text
                variant={"text2"}
                className="text-cloud-200 items-center hidden md:flex"
              >
                Next boost*
                <InfoTooltip>
                  Reflects your trading volume and the volume produced by your
                  liquidity.
                </InfoTooltip>
              </Text>
            )}
            <span
              className={cn({
                "text-green-caribbean": i === currentLevel,
              })}
            >
              {level.nextBoost}
            </span>
          </div>
        ))}
      </div>
    </BoxContainer>
  )
}
