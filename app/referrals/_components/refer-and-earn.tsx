"use client"
import { Check, Copy } from "lucide-react"
import React from "react"
import { TelegramShareButton, TwitterShareButton } from "react-share"
import { useAccount } from "wagmi"

import { Caption } from "@/components/typography/caption"
import { Text } from "@/components/typography/text"
import { Title } from "@/components/typography/title"
import { Button } from "@/components/ui/button-old"
import {
  CoinsIcon,
  MeterIcon,
  PersonIcon,
  TelegramIcon,
  Toucan,
  XIcon,
} from "@/svgs"
import BoxContainer from "./box-container"

export default function ReferAndEarn() {
  const { address } = useAccount()
  const referralLink = `${window.location.origin}/referrals/${address}`
  const sharingMessage = `Hey frens, check out Mangrove DEX on #Blast ⚡ Trade, re-stake liquidity and earn from up to six sources for yields and points on Blast L-2 🤯
${referralLink}
  `

  return (
    <div className="space-y-4">
      <BoxContainer className="relative">
        <Toucan className="w-[91px] h-auto absolute right-10 -top-20" />
        <Title variant={"title1"} className="mb-4">
          Refer and Earn
        </Title>
        <div className="flex items-center space-x-4 flex-col space-y-4 md:flex-row md:space-y-0">
          <Text
            variant={"text1"}
            className="bg-primary-dark-green p-4 rounded-md flex items-center justify-between w-full line-clamp-1"
          >
            <span className="line-clamp-1">{referralLink}</span>
            <CopyButton textToCopy={referralLink} />
          </Text>
          <TwitterShareButton url={sharingMessage}>
            <Button size={"lg"} className="whitespace-nowrap">
              Share on X
            </Button>
          </TwitterShareButton>
        </div>
        <hr className="my-8" />
        <div className="flex items-center justify-between">
          <Text variant={"text2"} className="text-cloud-200">
            Share to your network
          </Text>
          <div className="space-x-6">
            <Button size={"icon"} variant={"invisible"} asChild>
              <TwitterShareButton url={sharingMessage}>
                <XIcon className="w-6" />
              </TwitterShareButton>
            </Button>
            <Button size={"icon"} variant={"invisible"} asChild>
              <TelegramShareButton url={sharingMessage}>
                <TelegramIcon className="w-6" />
              </TelegramShareButton>
            </Button>
          </div>
        </div>
      </BoxContainer>
      <BoxContainer>
        <div className="flex space-x-2 items-center mb-8">
          <Title variant={"title1"}>Your referrals statistics</Title>
          <Caption className="bg-primary-dark-green rounded-full px-2 py-1">
            Overview of collected points will be available soon
          </Caption>
        </div>
        <div className="grid grid-cols-1  md:grid-cols-4 gap-2">
          <Item
            Icon={PersonIcon}
            iconClassName="size-8"
            title="Total Referrals"
            value="-"
          />
          <Item
            Icon={CoinsIcon}
            iconClassName="size-8"
            title="Points earned"
            value="-"
          />
          <Item
            Icon={MeterIcon}
            iconClassName="size-6"
            title="Volume generated"
            value="-"
          />
          <Item
            Icon={MeterIcon}
            iconClassName="size-6"
            title="Volume traded"
            value="-"
          />
        </div>
      </BoxContainer>
    </div>
  )
}

type ItemProps = {
  Icon: React.ComponentType<{ className?: string }>
  iconClassName?: string
  title: string
  value: string
}
function Item({ Icon, iconClassName, title, value }: ItemProps) {
  return (
    <div className="flex space-x-4">
      <div className="size-12 bg-primary-dark-green rounded-lg flex justify-center items-center">
        <Icon className={iconClassName} />
      </div>
      <div className="flex-col justify-center">
        <Caption
          variant={"caption1"}
          className="text-cloud-300 flex-1 line-clamp-1"
        >
          {title}
        </Caption>
        <Title variant={"title1"} className="flex-1">
          {value}
        </Title>
      </div>
    </div>
  )
}

const CopyButton = ({ textToCopy }: { textToCopy: string }) => {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = () => {
    setCopied(true)

    // Replace this with your copy function
    navigator.clipboard.writeText(textToCopy)

    setTimeout(() => setCopied(false), 2000) // Reset the icon after 2 seconds
  }

  return (
    <Button size={"icon"} variant={"invisible"} onClick={handleCopy}>
      {copied ? (
        <Check className={"w-4 text-green-caribbean"} />
      ) : (
        <Copy className={"w-4"} />
      )}
    </Button>
  )
}
