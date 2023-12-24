"use client"

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Form } from "./_components/form/form"
import { InfoBar } from "./_components/info-bar"
import { PriceRange } from "./_components/price-range/price-range"

export default function Page() {
  return (
    <div className="grid grid-rows-[auto,1fr] h-[calc(100vh-var(--bar-height))] w-full">
      <InfoBar />
      <div className="grid grid-cols-[25.375rem,1fr] max-w-8xl mx-auto w-full overflow-auto">
        <ScrollArea className="border-r border-l">
          <Form className="p-6" />
          <ScrollBar orientation="vertical" />
        </ScrollArea>
        <ScrollArea className="border-r">
          <PriceRange className="py-8" />
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </div>
    </div>
  )
}
