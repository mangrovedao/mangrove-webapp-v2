import { Title } from "@/components/typography/title"
import StratInfoBanner from "../shared/strat-info-banner"

import {
  CustomTabs,
  CustomTabsContent,
  CustomTabsList,
  CustomTabsTrigger,
} from "@/components/custom-tabs"
import { renderElement } from "@/utils/render"
import ParametersTable from "./table/parameters-table"

export enum ManageTabs {
  PARAMETERS = "parameters",
  // DEPOSIT_WITHDRAW = "Published / Unpublished",
}

const TABS_CONTENT = {
  [ManageTabs.PARAMETERS]: <ParametersTable />,
  // [ManageTabs.DEPOSIT_WITHDRAW]: <HistoryTable />,
}

function Tabs(props: React.ComponentPropsWithoutRef<typeof CustomTabs>) {
  return (
    <CustomTabs {...props} defaultValue={Object.values(ManageTabs)[0]}>
      <CustomTabsList className="w-full flex justify-start px-0 mt-8 border-b">
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

export default function History() {
  return (
    <div>
      <StratInfoBanner />
      <div className="py-10">
        <Title>Transaction History</Title>
        <Tabs />
      </div>
    </div>
  )
}
