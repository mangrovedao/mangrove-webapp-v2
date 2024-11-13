"use client"

import {
  CustomTabs,
  CustomTabsContent,
  CustomTabsList,
  CustomTabsTrigger,
} from "@/components/custom-tabs"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { renderElement } from "@/utils/render"
import React from "react"
import { useEventListener } from "usehooks-ts"
import BridgeComponent from "./components/bridge/bridge"
import QuickActions from "./components/quick-actions"
import Wrap from "./components/wrap"
import { ActionsTabs } from "./utils/types"

const TABS_CONTENT = {
  [ActionsTabs.QUICKACTIONS]: QuickActions,
  [ActionsTabs.KANDEL]: <div>TODO</div>,
  [ActionsTabs.BRIDGE]: BridgeComponent,
  [ActionsTabs.WRAP]: Wrap,
}

export default function Page() {
  const [tab, setTab] = React.useState(Object.values(ActionsTabs)[0])

  // @ts-expect-error
  useEventListener("on-more-tab-clicked", handleOnMoreTabClicked)

  function handleOnMoreTabClicked(
    event: CustomEvent<{ tab: ActionsTabs | undefined }>,
  ) {
    setTab(event.detail.tab)
  }

  return (
    <main className="flex flex-col min-h-screen mx-auto max-w-7xl">
      <CustomTabs value={tab}>
        <CustomTabsList className="w-full flex justify-start border-b">
          <CustomTabsTrigger
            key={`more-tab`}
            disabled={true}
            value={"more"}
            className="capitalize !text-primary"
          >
            <h1 className="text-2xl font-bold !text-primary">More</h1>
          </CustomTabsTrigger>
          {Object.values(ActionsTabs).map((table) => (
            <CustomTabsTrigger
              onClick={() => setTab(table)}
              key={`${table}-tab`}
              value={table}
              className="capitalize"
              id={`${table}-tab`}
              disabled={table === ActionsTabs.KANDEL}
              count={
                table === ActionsTabs.KANDEL
                  ? 0
                  : table === ActionsTabs.BRIDGE
                    ? 0
                    : 0
              }
            >
              {table}
            </CustomTabsTrigger>
          ))}
        </CustomTabsList>
        <div className="w-full pb-4 px-1 mt-8">
          {Object.values(ActionsTabs).map((table) => (
            <CustomTabsContent
              key={`${table}-content`}
              value={table}
              // style={{ height: "var(--history-table-content-height)" }}
            >
              <ScrollArea className="h-full" scrollHideDelay={200}>
                <div className="px-2 h-full">
                  {/* @ts-ignore */}
                  {renderElement(TABS_CONTENT[table])}
                </div>
                <ScrollBar orientation="vertical" className="z-50" />
                <ScrollBar orientation="horizontal" className="z-50" />
              </ScrollArea>
            </CustomTabsContent>
          ))}
        </div>
      </CustomTabs>
    </main>
  )
}
