import React from "react"

import { ChevronDown, ChevronUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { CustomNumericInput } from "@components/stateless/custom-numeric-input"
import { Label } from "@components/ui/label"

export default function LimitOrder() {
  const [isAdvanced, setisAdvanced] = React.useState(false)
  const [isSourcing, setIsSourcing] = React.useState(false)

  return (
    <div className="space-y-5 pt-5">
      <Separator />
      <div>
        <Label> Limit price</Label>
        <CustomNumericInput symbol="USDC" />
      </div>
      <Separator />

      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <Label>Fee</Label>
          <span>{0} %</span>
        </div>
        <Separator />
      </div>

      <Collapsible
        open={isAdvanced}
        onOpenChange={setisAdvanced}
        className="w-full space-y-2"
      >
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold">Advanced</h4>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="">
              {!isAdvanced && <ChevronDown className="h-6 w-6" />}
              {isAdvanced && <ChevronUp className="h-6 w-6" />}

              <span className="sr-only">Toggle</span>
            </Button>
          </CollapsibleTrigger>
        </div>
        <div className="grid text-md space-y-2">
          <Label>Time in force</Label>
          <Select>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Options" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="immediateOrCancel">
                  Immediate or cancel
                </SelectItem>
                <SelectItem value="goodTillTime">Good till time</SelectItem>
                <SelectItem value="fillOrKill">Fill or kill</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <CollapsibleContent className="space-y-2">
          <div className="flex justify-between space-x-2">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Options" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Options" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="hour">Hour</SelectItem>
                  <SelectItem value="minute">Minute</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </CollapsibleContent>
      </Collapsible>
      <Collapsible
        open={isSourcing}
        onOpenChange={setIsSourcing}
        className="w-full space-y-2"
      >
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold">Liquidity sourcing</h4>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="">
              {!isSourcing && <ChevronDown className="h-6 w-6" />}
              {isSourcing && <ChevronUp className="h-6 w-6" />}

              <span className="sr-only">Toggle</span>
            </Button>
          </CollapsibleTrigger>
        </div>
        <div className="flex text-md space-x-2">
          <span>From</span>
          <Switch />
          <span>To</span>
        </div>
        <CollapsibleContent className="space-y-2">
          <div className="flex justify-between space-x-2">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Options" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="wallet">
                    <div className="flex">
                      <div className="grid">
                        <span>Wallet</span>
                        <span>Est. APY over 7 days</span>
                      </div>

                      <span>1.50TH</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="aave">
                    <div className="flex">
                      <div className="grid">
                        <span>AAVE</span>
                        <span>Est. APY over 7 days</span>
                      </div>
                      <span>1.50TH</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="stargate">
                    <div className="flex">
                      <div className="grid">
                        <span>Stargate</span>
                        <span>Est. APY over 7 days</span>
                      </div>
                      <span>1.50TH</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="beefy">
                    <div className="flex">
                      <div className="grid">
                        <span>Beefy</span>
                        <span>Est. APY over 7 days</span>
                      </div>
                      <span>1.50TH</span>
                    </div>
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
