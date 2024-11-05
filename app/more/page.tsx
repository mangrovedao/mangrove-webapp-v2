"use client"

import {
  CustomTabs,
  CustomTabsContent,
  CustomTabsList,
  CustomTabsTrigger,
} from "@/components/custom-tabs"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { renderElement } from "@/utils/render"
import QuickActions from "./components/quick-actions"

export enum ActionsTabs {
  QUICKACTIONS = "Quick Actions",
  KANDEL = "Kandel",
  BRIDGE = "Bridge",
  WRAP = "Wrap",
}

const TABS_CONTENT = {
  [ActionsTabs.QUICKACTIONS]: QuickActions,
  [ActionsTabs.KANDEL]: <div>TODO</div>,
  [ActionsTabs.BRIDGE]: <div>TODO</div>,
  [ActionsTabs.WRAP]: <div>TODO</div>,
}

export default function Page() {
  return (
    <main className="flex flex-col min-h-screen mx-auto max-w-7xl">
      <CustomTabs defaultValue={Object.values(ActionsTabs)[0]}>
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
              key={`${table}-tab`}
              value={table}
              className="capitalize"
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
