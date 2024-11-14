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

      <style jsx global>{`
        table tbody * {
          @apply font-ubuntu !text-lg font-normal text-white;
        }
        table tbody tr:first-child td:first-child > div > div {
          max-width: 24px;
        }
      `}</style>
    </main>
  )
}
