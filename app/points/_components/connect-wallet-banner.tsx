/* eslint-disable @next/next/no-img-element */
import { useConnectModal } from "@rainbow-me/rainbowkit"

import { Text } from "@/components/typography/text"
import { Title } from "@/components/typography/title"
import { Button } from "@/components/ui/button-old"

export function ConnectWalletBanner() {
  const { openConnectModal } = useConnectModal()
  return (
    <>
      <div className="w-full max-w-[1252px] bg-white text-primary-dark-green rounded-lg mx-auto flex">
        <div className="space-y-6 p-8 flex-1 flex flex-col justify-center">
          <Title variant={"header1"}>
            Connect wallet to access MS1 Points Program!
          </Title>
          <span>
            <Button
              variant={"tertiary"}
              size={"lg"}
              className="px-5"
              onClick={openConnectModal}
            >
              Connect wallet
            </Button>
          </span>
        </div>
        <div className="h-auto w-1/2 relative rounded-lg overflow-hidden hidden xl:block">
          <img
            src="/assets/rewards/join-program.webp"
            alt="Illustrations with mangrove animals sitting on a bench"
            className="max-h-[250px] top-5 absolute right-10"
          />
        </div>
      </div>
      <Text variant={"text2"} className="mb-16 text-cloud-300 mt-4">
        We reserve the right to update point calculations at any time.
      </Text>
    </>
  )
}
