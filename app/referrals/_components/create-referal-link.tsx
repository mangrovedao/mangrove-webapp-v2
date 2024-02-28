"use client"
import { Check, Copy } from "lucide-react"
import React from "react"

import { Caption } from "@/components/typography/caption"
import { Title } from "@/components/typography/title"
import { Button } from "@/components/ui/button"
import { Toucan } from "@/svgs"
import BoxContainer from "./box-container"

export default function CreateReferralLink() {
  return (
    <BoxContainer className="relative">
      <Toucan className="w-[91px] h-auto absolute right-10 -top-20" />
      <Title variant={"title1"} className="mb-4">
        Create your referral link
      </Title>
      <div className="flex items-center space-x-4 flex-col space-y-4 md:flex-row md:space-y-0">
        <Button size={"lg"} className="whitespace-nowrap">
          Get my referral link
        </Button>
      </div>
    </BoxContainer>
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
