"use client"

import { Coins, Gauge, Percent } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

import {
  CustomRadioGroup,
  CustomRadioGroupItem,
} from "@/components/custom-radio-group"
import InfoTooltip from "@/components/info-tooltip"
import { TokenIcon } from "@/components/token-icon"
import { TokenPair } from "@/components/token-pair"
import { Caption } from "@/components/typography/caption"
import { Text } from "@/components/typography/text"
import { Title } from "@/components/typography/title"
import { Separator } from "@/components/ui/separator"
import { useMarkets } from "@/hooks/use-addresses"
import { Token } from "@mangrovedao/mgv"
import React, { ReactNode } from "react"
import { Badge } from "../(list)/_components/badge"
import { AddForm } from "./form/addForm"
import { RemoveForm } from "./form/removeForm"

enum Tabs {
  Details = "Details",
  Positions = "Positions",
}

enum Action {
  Add = "Add",
  Remove = "Remove",
}

export default function Page() {
  const [tab, setTab] = React.useState(Tabs.Details)
  const [action, setAction] = React.useState(Action.Add)

  const { push } = useRouter()
  const markets = useMarkets()
  const searchParams = useSearchParams()
  const market = searchParams.get("market")

  return (
    <div className="max-w-full mx-auto px-20 pb-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4 mt-8">
          <TokenPair
            baseToken={markets[0].base}
            quoteToken={markets[0].quote}
            tokenClasses="h-7 w-7"
          />
          <Badge>0.04%</Badge>
        </div>
      </div>

      <Separator className="mt-6" />

      <div className="grid grid-flow-col">
        <div className="col-span-2 w-full ">
          {/* Infos Cards */}
          <div className="flex gap-3 p-6">
            <InfoCard icon={<Gauge />} title="TVL" value="4.689.12" />
            <InfoCard icon={<Percent />} title="APY" value="63.23%" />
            <InfoCard icon={<Gauge />} title="Total Earned" value="$98.09" />
          </div>

          <Separator className="w-full my-6" />
          {/* Holding card */}
          <div className="p-6">
            <HoldingCard base={markets[0].base} quote={markets[0].quote} />
            <Line title="Entry/Exit Fee" value="5%" />
            <Line title="Performance Fee" value="5%" />
          </div>

          <Separator className="my-6" />
          {/* Details & Positions */}
          <div className="grid gap-8 px-6">
            <div className="w-80">
              <CustomRadioGroup
                name={"tab"}
                value={tab}
                onValueChange={(e: Tabs) => {
                  setTab(e)
                }}
              >
                {Object.values(Tabs).map((action) => (
                  <CustomRadioGroupItem
                    key={action}
                    value={action}
                    id={action}
                    className="capitalize"
                  >
                    {action}
                  </CustomRadioGroupItem>
                ))}
              </CustomRadioGroup>
            </div>
            {tab === Tabs.Details ? <Details /> : <Details />}
          </div>
        </div>

        <div className="row-span-4 border-l-2">
          <div className="grid gap-8 p-6">
            <div className="w-80">
              <CustomRadioGroup
                name={"action"}
                value={action}
                onValueChange={(e: Action) => {
                  console.log(e)
                  setAction(e)
                }}
              >
                {Object.values(Action).map((action) => (
                  <CustomRadioGroupItem
                    key={action}
                    value={action}
                    id={action}
                    className="capitalize"
                  >
                    {action}
                  </CustomRadioGroupItem>
                ))}
              </CustomRadioGroup>
            </div>
            {action === Action.Add ? <AddForm /> : <RemoveForm />}
          </div>

          <Separator className="my-6" />

          <div className="grid gap-4 px-6">
            <div className="flex gap-2 items-center">
              <div className="rounded-lg bg-primary-dark-green w-8 h-8 flex justify-center items-center">
                <Coins className="h-4 w-4" />
              </div>
              <Title>Position</Title>
            </div>

            <Separator />

            <div>
              <Title>Initial Deposit</Title>
              <Line
                title={
                  <div className="flex gap-2">
                    <TokenIcon
                      symbol={markets[0].base.symbol}
                      className="h-4 w-4"
                    />
                    <Caption className="text-gray text-xs">
                      {markets[0].base.symbol}
                    </Caption>
                  </div>
                }
                value="0.0123569"
              />
              <Line
                title={
                  <div className="flex gap-2">
                    <TokenIcon
                      symbol={markets[0].quote.symbol}
                      className="h-4 w-4"
                    />
                    <Caption className="text-gray text-xs">
                      {markets[0].quote.symbol}
                    </Caption>
                  </div>
                }
                value="0.0123569"
              />
            </div>

            <Separator />

            <div>
              <Title>Current Balance</Title>
              <Line
                title={
                  <div className="flex gap-2">
                    <TokenIcon
                      symbol={markets[0].base.symbol}
                      className="h-4 w-4"
                    />
                    <Caption className="text-gray text-xs">
                      {markets[0].base.symbol}
                    </Caption>
                  </div>
                }
                value="0.0123569"
              />
              <Line
                title={
                  <div className="flex gap-2">
                    <TokenIcon
                      symbol={markets[0].base.symbol}
                      className="h-4 w-4"
                    />
                    <Caption className="text-gray text-xs">
                      {markets[0].base.symbol}
                    </Caption>
                  </div>
                }
                value="0.0123569"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const Details = () => {
  return (
    <>
      <div className="flex gap-2 items-center">
        <div className="rounded-lg bg-primary-dark-green w-8 h-8 flex justify-center items-center">
          <Coins className="h-4 w-4" />
        </div>
        <Title>Details</Title>
      </div>

      <div className="bg-primary-bush-green rounded-lg flex justify-between px-8 py-4">
        <div className="grid justify-center ">
          <Caption className="text-gray">Price</Caption>
          <Caption>$1 234.12</Caption>
        </div>
        <Separator orientation="vertical" className="h-4 self-center" />
        <div className="grid">
          <Caption className="text-gray">Price Range</Caption>
          <Caption>1 431.59 / 1 759.00</Caption>
        </div>
        <Separator orientation="vertical" className="h-4 self-center" />
        <div className="grid">
          <Caption className="text-gray">Offers</Caption>
          <Caption>4</Caption>
        </div>
        <Separator orientation="vertical" className="h-4 self-center" />
        <div className="grid">
          <Caption className="text-gray">Asks Volume</Caption>
          <Caption>$1 234.12</Caption>
        </div>
        <Separator orientation="vertical" className="h-4 self-center" />
        <div className="grid">
          <Caption className="text-gray">Bids Volume</Caption>
          <Caption>$1 234.12</Caption>
        </div>
      </div>
      <div className="bg-primary-bush-green rounded-lg p-4">
        <Title>Liquid Staking Strategy</Title>
        <Caption className="text-gray">
          Suitable for those looking to optimize yield on liquid staked
          derivatives (LSDs). These strategies generate yield from the LSDs
          themselves and are further enhanced through both trading fees and
          external rewards (such as boosted liquidity pools).
        </Caption>
      </div>
    </>
  )
}

const Line = ({ title, value }: { title: ReactNode; value: ReactNode }) => {
  return (
    <div className="flex justify-between mt-2 items-center">
      <Caption className="text-gray text-xs"> {title}</Caption>
      <Caption className="text-gray text-xs">{value}</Caption>
    </div>
  )
}

const HoldingCard = ({ base, quote }: { base: Token; quote: Token }) => {
  return (
    <div className="bg-primary-bush-green rounded-lg w-full p-4">
      <Title variant="title2">Vault holdings</Title>
      <Separator className="my-4" />
      <div className="grid gap-2">
        <div className="flex justify-between">
          <div className="flex gap-2">
            <TokenIcon symbol={base.symbol} />
            <Text variant={"text1"} className="text-gray text-xs">
              {base.symbol}
            </Text>
          </div>
          <div className="flex gap-5">
            <Text>0.5600453453</Text>
            <div className="bg-primary-dark-green rounded-md w-14 h-7 flex justify-center items-center">
              <Text variant={"text2"} className="text-gray text-xs">
                61.23%
              </Text>
            </div>
          </div>
        </div>
        <div className="flex justify-between">
          <div className="flex gap-2">
            <TokenIcon symbol={quote.symbol} />
            <Text variant={"text1"} className="text-gray text-xs">
              {quote.symbol}
            </Text>
          </div>
          <div className="flex gap-5">
            <Text>1250.0000</Text>
            <div className="bg-primary-dark-green rounded-md w-14 h-7 flex justify-center items-center">
              <Caption className="text-gray text-xs">38.77%</Caption>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const InfoCard = ({
  title,
  value,
  icon,
  info,
}: {
  title: string
  value: string
  icon: ReactNode
  info?: string
}) => {
  return (
    <div className="bg-primary-bush-green rounded-lg p-4 w-full">
      <div className="flex items-center ">
        <Caption className="ml-10">{title}</Caption>
        {info ? <InfoTooltip>{info}</InfoTooltip> : undefined}
      </div>

      <div className="flex items-center gap-3 ml-2 ">
        <div className="bg-primary-dark-green rounded-md w-8 h-8 flex justify-center items-center">
          {icon}
        </div>
        <Text>{value}</Text>
      </div>
    </div>
  )
}
