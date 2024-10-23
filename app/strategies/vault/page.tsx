"use client"

import { MarketParams, publicMarketActions } from "@mangrovedao/mgv"
import type { GetKandelStateResult } from "@mangrovedao/mgv/actions/kandel/view"
import { useQuery } from "@tanstack/react-query"
import { Coins, ExternalLink, Gauge, Percent } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import React, { ReactNode } from "react"
import { formatUnits } from "viem"
import { useClient } from "wagmi"

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
import { useMangroveAddresses } from "@/hooks/use-addresses"
import { Badge } from "../(list)/_components/badge"
import { Vault } from "../(list)/_schemas/vaults"
import { useVault } from "./_hooks/useVault"
import { AddForm } from "./form/depositForm"
import { RemoveForm } from "./form/withdrawForm"

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

  const searchParams = useSearchParams()
  const vaultId = searchParams.get("id")
  const {
    data: { vault, kandelState },
    refetch,
  } = useVault(vaultId)

  React.useEffect(() => {
    setTimeout(() => refetch?.(), 1)
  }, [refetch])

  const { push } = useRouter()

  return (
    <div className="max-w-full mx-auto px-20 pb-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4 mt-8">
          <TokenPair
            baseToken={vault?.market.base}
            quoteToken={vault?.market.quote}
            tokenClasses="h-7 w-7"
          />
          <Badge>4.00%</Badge>
        </div>
      </div>

      <Separator className="mt-6" />

      <div className="grid grid-flow-col">
        <div className="col-span-2 w-full ">
          {/* Infos Cards */}
          <div className="flex gap-3 p-6">
            {/* <InfoCard icon={<Gauge />} title="TVL" value="4.689.12" /> */}
            <InfoCard icon={<Percent />} title="Estimated APY" value="4.00%" />
            <InfoCard
              icon={<Gauge />}
              title="Strategist"
              value={vault?.strategist || ""}
              link={true}
            />
          </div>

          <Separator className="w-full my-6" />
          {/* Holding card */}
          <div className="p-6">
            <HoldingCard
              market={vault?.market}
              baseAmount={vault?.totalBase}
              quoteAmount={vault?.totalQuote}
            />
            <Line
              title="Exit Fee"
              value={`${((vault?.fees || 0) * 100).toFixed(2)}%`}
            />
            <Line title="Performance Fee" value="0.00%" />
          </div>

          <Separator className="my-6" />
          {/* Details & Positions */}
          <div className="grid gap-8 px-6">
            {/* <div className="w-80">
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
            </div> */}
            {/* {tab === Tabs.Details ? <Details /> : <Details />} */}
            <Details vault={vault} kandel={kandelState} />
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

            {/* <div>
              <Title>Initial Deposit</Title>
              <Line
                title={
                  <div className="flex gap-2">
                    <TokenIcon
                      symbol={vault?.market.base.symbol}
                      className="h-4 w-4"
                    />
                    <Caption className="text-gray text-xs">
                      {vault?.market.base.symbol}
                    </Caption>
                  </div>
                }
                value="0.0123569"
              />
              <Line
                title={
                  <div className="flex gap-2">
                    <TokenIcon
                      symbol={vault?.market.quote.symbol}
                      className="h-4 w-4"
                    />
                    <Caption className="text-gray text-xs">
                      {vault?.market.quote.symbol}
                    </Caption>
                  </div>
                }
                value="0.0123569"
              />
            </div>

            <Separator /> */}

            <div>
              <Title>Current Balance</Title>
              <Line
                title={
                  <div className="flex gap-2">
                    <TokenIcon
                      symbol={vault?.market.base.symbol}
                      className="h-4 w-4"
                    />
                    <Caption className="text-gray text-xs">
                      {vault?.market.base.symbol}
                    </Caption>
                  </div>
                }
                value={Number(
                  formatUnits(
                    vault?.balanceBase || 0n,
                    vault?.market.base.decimals || 18,
                  ),
                ).toLocaleString(undefined, {
                  maximumFractionDigits:
                    vault?.market.base.displayDecimals || 3,
                })}
              />
              <Line
                title={
                  <div className="flex gap-2">
                    <TokenIcon
                      symbol={vault?.market.quote.symbol}
                      className="h-4 w-4"
                    />
                    <Caption className="text-gray text-xs">
                      {vault?.market.quote.symbol}
                    </Caption>
                  </div>
                }
                value={
                  Number(
                    formatUnits(
                      vault?.balanceQuote || 0n,
                      vault?.market.quote.decimals || 18,
                    ),
                  ).toLocaleString(undefined, {
                    maximumFractionDigits:
                      vault?.market.quote.displayDecimals || 3,
                  }) || "0"
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const Details = ({
  kandel,
  vault,
}: {
  kandel?: GetKandelStateResult
  vault?: Vault
}) => {
  const firstAskPrice = kandel?.asks[0]?.price
  const lastBidPrice = kandel?.bids[0]?.price
  const price =
    (firstAskPrice
      ? lastBidPrice
        ? (firstAskPrice + lastBidPrice) / 2
        : firstAskPrice
      : lastBidPrice) || 0

  const minBidPrice = kandel?.bids.at(-1)?.price
  const maxBidPrice = kandel?.bids[0]?.price
  const minAskPrice = kandel?.asks[0]?.price
  const maxAskPrice = kandel?.asks.at(-1)?.price

  const minPrice =
    minBidPrice === undefined
      ? minAskPrice === undefined
        ? 0
        : minAskPrice
      : minBidPrice
  const maxPrice =
    maxAskPrice === undefined
      ? maxBidPrice === undefined
        ? 0
        : maxBidPrice
      : maxAskPrice

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
          <Caption>
            {price.toLocaleString(undefined, {
              maximumFractionDigits:
                vault?.market.quote.priceDisplayDecimals || 4,
            })}{" "}
            {vault?.market.quote.symbol}
          </Caption>
        </div>
        <Separator orientation="vertical" className="h-4 self-center" />
        <div className="grid">
          <Caption className="text-gray">Price Range</Caption>
          <Caption>
            {minPrice.toLocaleString(undefined, {
              maximumFractionDigits:
                vault?.market.quote.priceDisplayDecimals || 4,
            })}{" "}
            /{" "}
            {maxPrice.toLocaleString(undefined, {
              maximumFractionDigits:
                vault?.market.quote.priceDisplayDecimals || 4,
            })}
          </Caption>
        </div>
        <Separator orientation="vertical" className="h-4 self-center" />
        <div className="grid">
          <Caption className="text-gray">Offers</Caption>
          <Caption>{kandel?.pricePoints || 0}</Caption>
        </div>
        <Separator orientation="vertical" className="h-4 self-center" />
        <div className="grid">
          <Caption className="text-gray">Asks Volume</Caption>
          <Caption>
            {Number(
              formatUnits(
                kandel?.baseAmount || 0n,
                vault?.market.base.decimals || 18,
              ),
            ).toLocaleString(undefined, {
              maximumFractionDigits: vault?.market.base.displayDecimals || 3,
            })}{" "}
            {vault?.market.base.symbol}
          </Caption>
        </div>
        <Separator orientation="vertical" className="h-4 self-center" />
        <div className="grid">
          <Caption className="text-gray">Bids Volume</Caption>
          <Caption>
            {Number(
              formatUnits(
                kandel?.quoteAmount || 0n,
                vault?.market.quote.decimals || 18,
              ),
            ).toLocaleString(undefined, {
              maximumFractionDigits: vault?.market.quote.displayDecimals || 3,
            })}{" "}
            {vault?.market.quote.symbol}
          </Caption>
        </div>
      </div>
      <div className="bg-primary-bush-green rounded-lg p-4">
        <Title>Passive strategies</Title>
        <Caption className="text-gray">
          Passive strategies on Mangrove are managed by third-party active
          liquidity managers. This strategy is managed by SkateFi (formerly
          known as Range protocol). SkateFi quantitative strategies
          strategically deploy liquidity within narrow price bandwidths, with
          liquidity actively monitored and rebalanced in real-time. Positions
          are quickly adjusted based on volatile market conditions or trending
          markets, with rebalancing spread minimized to optimize yield.{" "}
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

const HoldingCard = ({
  market,
  baseAmount = 0n,
  quoteAmount = 0n,
}: {
  market?: MarketParams
  baseAmount?: bigint
  quoteAmount?: bigint
}) => {
  const base = market?.base
  const quote = market?.quote
  const numberBase = Number(formatUnits(baseAmount, base?.decimals || 18))
  const numberQuote = Number(formatUnits(quoteAmount, quote?.decimals || 18))

  const client = useClient()
  const mangrove = useMangroveAddresses()

  const { data: midPrice } = useQuery({
    queryKey: [
      "vault-market-mid-price",
      base?.address,
      quote?.address,
      mangrove?.mgv,
      mangrove?.mgvReader,
      client,
    ],
    enabled: !!market && !!client && !!mangrove,
    queryFn: async () => {
      if (!market || !client || !mangrove)
        throw new Error("Missing dependencies")

      const book = await client
        .extend(publicMarketActions(mangrove, market))
        .getBook({ depth: 1n })
      return book.midPrice
    },
    initialData: 3500,
    staleTime: Infinity,
  })

  const total = numberBase * midPrice + numberQuote

  const basePercent = total === 0 ? 50 : (numberBase * 100 * midPrice) / total
  const quotePercent = 100 - basePercent

  return (
    <div className="bg-primary-bush-green rounded-lg w-full p-4">
      <Title variant="title2">Vault holdings</Title>
      <Separator className="my-4" />
      <div className="grid gap-2">
        <div className="flex justify-between">
          <div className="flex gap-2">
            <TokenIcon symbol={base?.symbol} />
            <Text variant={"text1"} className="text-gray text-xs">
              {base?.symbol}
            </Text>
          </div>
          <div className="flex gap-5">
            <Text>
              {numberBase.toLocaleString(undefined, {
                maximumFractionDigits: base?.displayDecimals || 3,
              })}
            </Text>
            <div className="bg-primary-dark-green rounded-md w-14 h-7 flex justify-center items-center">
              <Text variant={"text2"} className="text-gray text-xs">
                {basePercent.toFixed(2)}%
              </Text>
            </div>
          </div>
        </div>
        <div className="flex justify-between">
          <div className="flex gap-2">
            <TokenIcon symbol={quote?.symbol} />
            <Text variant={"text1"} className="text-gray text-xs">
              {quote?.symbol}
            </Text>
          </div>
          <div className="flex gap-5">
            <Text>
              {numberQuote.toLocaleString(undefined, {
                maximumFractionDigits: quote?.displayDecimals || 3,
              })}
            </Text>
            <div className="bg-primary-dark-green rounded-md w-14 h-7 flex justify-center items-center">
              <Caption className="text-gray text-xs">
                {quotePercent.toFixed(2)}%
              </Caption>
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
  link,
}: {
  title: string
  value: string
  icon: ReactNode
  info?: string
  link?: boolean
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
        {link ? (
          <Link
            href={"https://app.rangeprotocol.com/"}
            target="_blank"
            rel="noreferrer"
            className="flex gap-2 items-center"
          >
            {value}
            <ExternalLink className="h-5 w-5" />
          </Link>
        ) : (
          <Text>{value}</Text>
        )}
      </div>
    </div>
  )
}
