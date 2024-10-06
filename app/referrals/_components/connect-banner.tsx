"use client"

import { useConnectModal } from "@rainbow-me/rainbowkit"
import { useAccount } from "wagmi"

import { Title } from "@/components/typography/title"
import { Button } from "@/components/ui/button-old"
import BoxContainer from "./box-container"

export default function ConnectBanner() {
  const { openConnectModal } = useConnectModal()
  const { isConnected } = useAccount()

  if (isConnected) return null

  return (
    <BoxContainer className="flex justify-between items-center flex-col space-y-2 md:flex-row md:space-y-0">
      <Title variant={"title1"}>Connect wallet to start referring</Title>
      <Button size={"lg"} onClick={openConnectModal}>
        Connect wallet
      </Button>
    </BoxContainer>
  )
}
