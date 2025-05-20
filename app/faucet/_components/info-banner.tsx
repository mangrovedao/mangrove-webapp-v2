"use client"
import * as wagmiChains from "wagmi/chains"

/* eslint-disable @next/next/no-img-element */
import { Text } from "@/components/typography/text"
import { Title } from "@/components/typography/title"
import { useAccount } from "wagmi"

export function InfoBanner() {
  const { chainId } = useAccount()
  return (
    <div className="w-full max-w-[1252px] bg-primary-dark-green rounded-lg mx-auto flex">
      <div className="space-y-6 p-8 flex-1 flex flex-col justify-center">
        <Title variant={"header1"}>Welcome to the Oxium Testnet Faucet!</Title>
        <div className="space-y-2">
          <Text variant={"text2"} as={"p"}>
            Ensure your wallet is set to a testnet chain, select your desired
            tokens, and click Faucet to receive them. Please note that these
            testnet tokens have no real value.
          </Text>
          {chainId === wagmiChains.polygonMumbai.id ? (
            <Text variant={"text2"} as={"p"}>
              For AAVE tokens on the testnet, visit the AAVE Faucet and set your
              wallet accordingly.
            </Text>
          ) : undefined}
        </div>
      </div>
    </div>
  )
}
