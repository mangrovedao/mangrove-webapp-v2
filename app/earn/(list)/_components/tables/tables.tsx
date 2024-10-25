import React from "react"

import { CustomTabs } from "@/components/custom-tabs"
import { useAccount } from "wagmi"
import { MyVaults } from "./my-vaults/my-vaults"
import { Vaults } from "./vaults/vaults"

import { Title } from "@/components/typography/title"
import { Button } from "@/components/ui/button-new"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SearchInput } from "@/components/ui/search-input-new"
import { ChevronDown } from "@/svgs"
import { ListFilter } from "lucide-react"

enum StrategyType {
  PASSIVE = "Passive",
  PRO = "Pro",
}

export function Tables({
  className,
  hideCreateStrat,
  ...props
}: React.ComponentProps<typeof CustomTabs> & {
  hideCreateStrat: (bool: boolean) => void
}) {
  const [strategiesType, setStrategiesType] = React.useState(StrategyType.PRO)
  const { chain } = useAccount()
  React.useEffect(() => {
    if (strategiesType === "Passive") {
      hideCreateStrat(true)
    } else {
      hideCreateStrat(false)
    }
  }, [strategiesType])

  return (
    <div className="pt-4 space-y-4">
      <div className="grid gap-y-4">
        <Title variant={"title1"} className="pl-4">
          My positions
        </Title>
        <MyVaults />
      </div>
      <div className="grid gap-y-4">
        <div className="flex gap-2 w-full justify-between items-center">
          <Title variant={"title1"} className="pl-4">
            All Vaults
          </Title>

          <div className="flex gap-2">
            <SearchInput
              placeholder="Search vault"
              className="text-text-placeholder"
            />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  className="flex gap-2 items-center text-text-primary"
                  size="sm"
                >
                  <ListFilter className="h-5 w-5" />
                  Filter
                  <ChevronDown className="w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mt-1">
                {/* <DropdownMenuLabel>Addresses:....</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => undefined}>
                  <span>Account</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Chain: {chain?.name}</DropdownMenuLabel>
                <DropdownMenuItem asChild> test</DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => undefined}>
                    <Copy className="mr-2 h-4 w-4" />
                    <span>Copy address</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>test</DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuItem onClick={() => undefined}>
                  <span>Reset</span>
                </DropdownMenuItem> */}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <Vaults type="all" />
      </div>
    </div>
  )
}
