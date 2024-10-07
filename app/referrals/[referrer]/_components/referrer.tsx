"use client"
import { useParams } from "next/navigation"
import { Address } from "viem"

import { Button } from "@/components/ui/button-old"
import { Skeleton } from "@/components/ui/skeleton"
import { ExclamationMark } from "@/svgs"
import { shortenAddress } from "@/utils/wallet"
import BoxContainer from "../../_components/box-container"
import { useCanBeReferred, useRefer, useSignReferral } from "../services"

export default function Referrer() {
  const { data, error, isPending: canBeReferredPending } = useCanBeReferred()
  const params = useParams<{ referrer: Address }>()
  const { mutate: sign, isPending: signPending } = useSignReferral()
  const { mutate: refer, isPending: isReferring } = useRefer()

  const isPending = signPending || isReferring || canBeReferredPending

  if (isPending) {
    return <Skeleton className="w-full h-40" />
  }

  if (error) {
    return (
      <BoxContainer className="text-2xl font-axiforma text-center mb-20 mx-auto flex flex-col items-center">
        <ExclamationMark className="text-red-300" />
        <div>
          Due to excessive demand, we are unable to return your data. Please try
          again later.
        </div>
      </BoxContainer>
    )
  }

  if (data?.error === "wrong referrer") {
    return (
      <BoxContainer className="text-2xl font-axiforma text-center mb-20 mx-auto flex flex-col items-center">
        <ExclamationMark className="text-red-300" />
        <div>You can not be referred by this address</div>
      </BoxContainer>
    )
  }

  if (data?.error === "already referred") {
    return (
      <BoxContainer className="text-2xl font-axiforma text-center mb-20 mx-auto flex flex-col items-center">
        <ExclamationMark className="text-red-300" />
        <div>You already have been referred</div>
      </BoxContainer>
    )
  }

  return (
    <div>
      <div className="text-5xl font-axiforma text-center mb-20 mx-auto">
        Welcome!&nbsp; <br /> You've been invited to join <br />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 48 48"
          className="size-8 mx-1 inline-block"
        >
          <rect width="48" height="48" fill="#00DF81" rx="24"></rect>
          <path
            fill="#041918"
            d="M35.543 23.528c-1.752 0-3.352.663-4.635 1.77a11.601 11.601 0 00-3.387-1.674 5.99 5.99 0 001.752-1.848c1.823-.034 3.551-.64 4.858-1.892 1.6-1.533 2.197-3.678 1.916-5.857a8.786 8.786 0 00-1.09-.062c-1.886 0-3.674.607-5.021 1.898-1.348 1.292-1.98 3.01-1.98 4.818-.61 1.208-1.759 2.055-3.1 2.32v-4.05c1.312-1.274 2.115-2.908 2.115-4.71 0-2.168-1.155-4.095-2.965-5.442-1.81 1.342-2.965 3.268-2.965 5.441 0 1.803.803 3.443 2.11 4.712v4.07c-1.383-.24-2.573-1.088-3.206-2.318 0-1.814-.627-3.544-1.98-4.835-1.348-1.292-3.135-1.898-5.022-1.898-.357 0-.72.017-1.09.062-.287 2.178.31 4.323 1.916 5.856 1.301 1.247 3.024 1.854 4.846 1.893a5.923 5.923 0 001.787 1.87c-1.183.37-2.297.92-3.304 1.645-1.284-1.1-2.883-1.769-4.635-1.769-2.262 0-4.272 1.107-5.678 2.842 1.4 1.735 3.41 2.841 5.678 2.841 1.722 0 3.299-.64 4.57-1.713.047-.039.094-.084.14-.123.071-.062.136-.124.2-.185a9.938 9.938 0 015.771-2.415v3.673c-4.716.404-8.449 4.144-8.666 8.754h1.705c.176-3.734 3.165-6.71 6.967-7.11v7.07h1.706v-7.07c3.796.388 6.796 3.37 6.984 7.11h1.705c-.228-4.616-3.973-8.361-8.69-8.754V24.78a9.961 9.961 0 015.778 2.42c.064.057.123.119.187.175.047.045.1.09.147.135 1.271 1.067 2.848 1.712 4.57 1.712 2.262 0 4.272-1.106 5.678-2.841-1.4-1.735-3.41-2.841-5.678-2.841l.006-.012zm-4.406-6.502c1.025-.983 2.244-1.309 3.252-1.399-.111 1.225-.604 2.297-1.46 3.106-1.025.982-2.243 1.308-3.251 1.398.111-1.224.603-2.297 1.459-3.105zM22.74 14.24c0-1.145.446-2.252 1.26-3.19.826.944 1.26 2.034 1.26 3.19 0 1.157-.446 2.252-1.26 3.19-.826-.944-1.26-2.044-1.26-3.19zm-7.77 4.493c-.855-.82-1.347-1.887-1.458-3.106.996.084 2.226.416 3.252 1.399.843.82 1.347 1.886 1.459 3.105-.996-.084-2.227-.416-3.252-1.398zm-2.513 8.844c-1.201 0-2.35-.427-3.328-1.207.984-.792 2.133-1.208 3.328-1.208 1.195 0 2.35.427 3.328 1.208-.984.791-2.121 1.207-3.328 1.207zm23.08 0c-1.2 0-2.35-.427-3.328-1.207.984-.792 2.133-1.208 3.328-1.208 1.196 0 2.35.427 3.328 1.208-.984.791-2.12 1.207-3.328 1.207z"
          ></path>
        </svg>
        <span className="text-green-caribbean">mangrove</span>
      </div>
      <h1 className="w-full text-center">
        You have been invited by {shortenAddress(params.referrer)}
      </h1>
      <div className="w-full flex justify-center mt-2">
        <Button
          onClick={() => {
            sign(undefined, {
              onSuccess: (signature) => {
                if (!signature) return
                refer(signature)
              },
            })
          }}
          disabled={isPending}
        >
          {signPending
            ? "Signing..."
            : isReferring
              ? "Referring..."
              : "Accept referral"}
        </Button>
      </div>
    </div>
  )
}
