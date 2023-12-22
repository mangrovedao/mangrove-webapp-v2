/* eslint-disable @next/next/no-img-element */
import { Text } from "@/components/typography/text"
import { Title } from "@/components/typography/title"

export function InfoBanner() {
  return (
    <div className="w-full max-w-[1252px] bg-primary-dark-green rounded-lg mx-auto flex">
      <div className="h-auto w-1/3 relative rounded-lg overflow-hidden hidden xl:block">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 411 242"
          preserveAspectRatio="xMinYMin slice"
        >
          <path
            fill="#021B1A"
            fillRule="evenodd"
            d="M33.077-41.908c-68.356 26.144-141.9 71.999-154.504 143.992-12.414 70.906 56.164 124.282 97.2 183.323 37.934 54.576 63.502 129.835 128.932 142.022 64.691 12.049 116.727-46.79 169.315-86.473 46.012-34.719 90.614-70.371 110.269-124.499 22.591-62.211 43.306-137.51 4.226-190.795-38.32-52.248-116.776-37.458-180.516-49.576C148.15-35.29 90.04-63.696 33.077-41.908z"
            clipRule="evenodd"
          ></path>
        </svg>
        <div className="absolute inset-0 pt-[20px] pb-[23px] pl-[27px]">
          <img
            src="/assets/strategies/info-banner-illustration.webp"
            alt="monkey and bird playing chess illustration"
          />
        </div>
      </div>
      <div className="space-y-6 p-8 flex-1 flex flex-col justify-center">
        <Title variant={"header1"}>
          Welcome to the Mangrove Testnet Faucet!
        </Title>
        <div className="space-y-2">
          <Text variant={"text2"} as={"p"}>
            Ensure your wallet is set to a testnet chain, select your desired
            tokens, and click Faucet to receive them. Please note that these
            testnet tokens have no real value.
          </Text>
          <Text variant={"text2"} as={"p"}>
            For AAVE tokens on the testnet, visit the AAVE Faucet and set your
            wallet accordingly.
          </Text>
        </div>
      </div>
    </div>
  )
}
