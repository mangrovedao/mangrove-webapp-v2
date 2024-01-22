"use client"

import useKandel from "./_providers/kandel-strategy"

export default function Page() {
  const { strategyQuery, strategyAddress } = useKandel()
  return <div>Page {strategyAddress}</div>
}
