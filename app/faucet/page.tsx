"use client"
import { redirect } from "next/navigation"
import React from "react"

import { Title } from "@/components/typography/title"
import { useNetwork } from "wagmi"
import { InfoBanner } from "./_components/info-banner"
import { FaucetTable } from "./_components/table/table"

export default function Page() {
  const { chain } = useNetwork()

  React.useEffect(() => {
    if (chain?.id) {
      if (!chain.testnet) redirect("/")
    }
  }, [chain])

  return (
    <>
      <InfoBanner />
      <Title className="mt-[56px]">Faucet</Title>
      <FaucetTable />
    </>
  )
}
