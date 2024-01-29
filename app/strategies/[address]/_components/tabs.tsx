import {
  CustomTabs,
  CustomTabsContent,
  CustomTabsList,
  CustomTabsTrigger,
} from "@/components/custom-tabs"
import { renderElement } from "@/utils/render"
import Overview from "./overview/overview"

export enum ManageTabs {
  OVERVIEW = "overview",
  PARAMETERS = "parameters",
}

const TABS_CONTENT = {
  [ManageTabs.OVERVIEW]: <Overview />,
  [ManageTabs.PARAMETERS]: <div>Parameters</div>,
}

export default function Tabs(
  props: React.ComponentPropsWithoutRef<typeof CustomTabs>,
) {
  return (
    <CustomTabs {...props} defaultValue={Object.values(ManageTabs)[0]}>
      <CustomTabsList className="w-full flex justify-start px-0 mt-16">
        {Object.values(ManageTabs).map((table) => (
          <CustomTabsTrigger
            key={`${table}-tab`}
            value={table}
            className="capitalize"
          >
            {table}
          </CustomTabsTrigger>
        ))}
      </CustomTabsList>
      <div className="w-full py-4 px-1 h-full relative">
        <div className="border-b absolute -left-full -right-full -mt-4" />

        {Object.values(ManageTabs).map((table) => (
          <CustomTabsContent
            key={`${table}-content`}
            value={table}
            style={{ height: "var(--history-table-content-height)" }}
          >
            <div className="">{renderElement(TABS_CONTENT[table])}</div>
          </CustomTabsContent>
        ))}
      </div>
    </CustomTabs>
  )
}
