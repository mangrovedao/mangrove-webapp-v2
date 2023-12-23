"use client"
import React from "react"

import { Title } from "@/components/typography/title"
import { Button } from "@/components/ui/button"
import { InfoBanner } from "./_components/info-banner"
import { NewStrategyDialog } from "./_components/new-strategy-dialog"
import { Tables } from "./_components/tables/tables"

export default function Page() {
  const [isNewDialogOpen, toggleIsNewDialogOpen] = React.useReducer(
    (isOpen) => !isOpen,
    false,
  )

  return (
    <>
      <InfoBanner />
      <div className="mt-[56px] flex justify-between items-center">
        <Title>Strategies</Title>
        <Button
          size={"lg"}
          rightIcon
          onClick={toggleIsNewDialogOpen}
          suppressHydrationWarning
        >
          Create strategy
        </Button>
      </div>
      <Tables />
      <NewStrategyDialog
        open={isNewDialogOpen}
        onClose={toggleIsNewDialogOpen}
      />
    </>
  )
}
