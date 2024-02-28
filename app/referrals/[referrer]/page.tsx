"use client"
import { Button } from "@/components/ui/button"
import { useSignReferral } from "../services"
import { useCanBeReferred, useRefer } from "./services"

export default function Page() {
  const { data, error } = useCanBeReferred()
  const { mutate: sign, isPending: signPending } = useSignReferral()
  const { mutate: refer, isPending: isReferring } = useRefer()

  const isPending = signPending || isReferring
  console.log(error?.message, error?.cause, error?.name, data)

  if (data?.error === "wrong referrer") {
    return <div>Wrong referrer</div>
  }

  if (data?.error === "already referred") {
    return <div>Already referred</div>
  }

  return (
    <div>
      <h1>Page</h1>
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
  )
}
