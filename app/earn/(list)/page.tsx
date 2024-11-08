"use client"

import { Title } from "@/components/typography/title"
import { Tables } from "./_components/tables/tables"

export default function Page() {
  return (
    <main>
      <div className="mt-[56px] flex justify-between items-center">
        <Title variant={"header1"} className="pl-4">
          Earn
        </Title>
      </div>
      <Tables />
    </main>
  )
}
