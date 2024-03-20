/* eslint-disable @next/next/no-img-element */
import { Text } from "@/components/typography/text"
import { Title } from "@/components/typography/title"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useUserPoints } from "./leaderboard/use-leaderboard"

const BULLETS = [
  "hold $100 equivalent in trading or liquidity provision",
  "participation in testnet (hold a Mangrove NFT) or beta mainnet",
]

export function JoinProgramBanner() {
  const { data } = useUserPoints()
  const points = data?.[0]?.total_points ?? 0

  if (Number(points) >= 100) return null

  return (
    <>
      <div className="w-full max-w-[1252px] bg-white text-primary-dark-green rounded-lg mx-auto flex">
        <div className="space-y-6 p-8 flex-1 flex flex-col justify-center">
          <Title variant={"header1"}>Join MS1 Points Program!</Title>
          <Title className="text-green-bangladesh" variant={"title3"}>
            Become eligible by making the equivalent of $100 in trading volume
            (market orders) or generated volume (limit orders).
          </Title>

          <span>
            <Button variant={"tertiary"} size={"md"} className="px-5" asChild>
              <Link href={"/trade"}>Trade now</Link>
            </Button>
          </span>
        </div>
        <div className="h-auto w-1/2 relative rounded-lg overflow-hidden hidden xl:block">
          <img
            src="/assets/rewards/join-program.webp"
            alt="Illustrations with mangrove animals sitting on a bench"
            className="max-h-[300px] top-5 absolute right-10"
          />
        </div>
      </div>
      <Text variant={"text2"} className="mb-16 text-cloud-300 mt-4">
        We reserve the right to update point calculations at any time.
      </Text>
    </>
  )
}
