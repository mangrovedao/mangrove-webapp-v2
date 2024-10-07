"use client"

import { Title } from "@/components/typography/title"
import { Button } from "@/components/ui/button-old"
import { Toucan } from "@/svgs"
import { useCreateReferralLink, useSignReferral } from "../services"
import BoxContainer from "./box-container"

export default function CreateReferralLink() {
  const { isPending: signPending, mutate: sign } = useSignReferral()
  const { isPending: createReferalLinkPending, mutate: createReferalLink } =
    useCreateReferralLink()
  const isPending = signPending || createReferalLinkPending

  return (
    <BoxContainer className="relative">
      <Toucan className="w-[91px] h-auto absolute right-10 -top-20" />
      <Title variant={"title1"} className="mb-4">
        Create your referral link
      </Title>
      <div className="flex items-center space-x-4 flex-col space-y-4 md:flex-row md:space-y-0">
        <Button
          size={"lg"}
          className="whitespace-nowrap"
          onClick={() =>
            sign(undefined, {
              onSuccess: (signature) => {
                if (!signature) return
                createReferalLink(signature)
              },
            })
          }
          disabled={isPending}
        >
          {signPending
            ? "Signing..."
            : createReferalLinkPending
              ? "Creating link..."
              : "Create referral link"}
        </Button>
      </div>
    </BoxContainer>
  )
}
