/* eslint-disable @next/next/no-img-element */
import { Text } from "@/components/typography/text"
import { Title } from "@/components/typography/title"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const BULLETS = [
  "hold $100 equivalent in trading or liquidity provision",
  "participation in testnet (hold a Mangrove NFT) or beta mainnet",
]

export function JoinProgramBanner() {
  return (
    <>
      <div className="w-full max-w-[1252px] bg-white text-primary-dark-green rounded-lg mx-auto flex">
        <div className="space-y-6 p-8 flex-1 flex flex-col justify-center">
          <Title variant={"header1"}>Join MS1 Points Program!</Title>
          <Title className="text-green-bangladesh" variant={"title3"}>
            Become eligible through one of:
          </Title>
          <ul className="list-disc !ml-4 !m-0">
            {BULLETS.map((bullet) => (
              <Text variant={"text2"} as={"li"} key={bullet}>
                {bullet}
              </Text>
            ))}
          </ul>
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
