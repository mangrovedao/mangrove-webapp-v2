"use client"
import { useCanBeReferred } from "./services"

export default function Page() {
  const { data, error } = useCanBeReferred()

  console.log(error?.message, error?.cause, error?.name, data)

  if (data?.error === "wrong referrer") {
    return <div>Wrong referrer</div>
  }

  if (data?.error === "already referred") {
    return <div>Already referred</div>
  }

  return <pre>Page</pre>
}
