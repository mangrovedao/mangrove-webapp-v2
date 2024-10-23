"use client"

import {
  CheckIcon,
  ChevronRight,
  Coins,
  ExternalLink,
  Globe,
  Mail,
  Send,
  SquareArrowOutUpRight,
  Twitter,
} from "lucide-react"
import { useParams, useRouter } from "next/navigation"

import {
  CustomRadioGroup,
  CustomRadioGroupItem,
} from "@/components/custom-radio-group-new"
import InfoTooltip from "@/components/info-tooltip-new"
import NeonContainer from "@/components/neon-container"
import { TokenIcon } from "@/components/token-icon-new"
import { Caption } from "@/components/typography/caption"
import { Text } from "@/components/typography/text"
import { Title } from "@/components/typography/title"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useMangroveAddresses } from "@/hooks/use-addresses"
import { MangroveLogo } from "@/svgs"
import { cn } from "@/utils"
import { shortenAddress } from "@/utils/wallet"
import { MarketParams, publicMarketActions } from "@mangrovedao/mgv"
import type { GetKandelStateResult } from "@mangrovedao/mgv/actions/kandel/view"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import React, { ReactNode } from "react"
import { formatUnits } from "viem"
import { useAccount, useClient } from "wagmi"
import { Vault } from "../(list)/_schemas/vaults"
import { Line, getChainImage } from "../(shared)/utils"
import { useVault } from "./_hooks/use-vault"
import { Accordion } from "./form/components/accordion"
import { DepositForm } from "./form/depositForm"
import { WithdrawForm } from "./form/withdrawForm"

enum Tabs {
  Details = "Details",
  Positions = "Positions",
}

enum Action {
  Deposit = "Deposit",
  Withdraw = "Withdraw",
}

export default function Page() {
  const [tab, setTab] = React.useState(Tabs.Details)
  const [action, setAction] = React.useState(Action.Deposit)
  const { chain } = useAccount()
  const params = useParams<{ address: string }>()

  const {
    data: { vault },
    refetch,
  } = useVault(params.address)

  React.useEffect(() => {
    setTimeout(() => refetch?.(), 1)
  }, [refetch])

  const { push } = useRouter()

  return (
    <div className="max-w-full mx-auto lg:px-20 md:px-10 pb-4">
      {/* BreadCrumb   */}
      <div className="flex items-center gap-2 pb-4">
        <Link href={"/"} className="flex items-center gap-2">
          <Caption className="text-text-quaternary">Earn</Caption>
          <ChevronRight className="h-4 w-4 text-text-disabled" />
        </Link>
        <Caption className="text-text-secondary">Vault details</Caption>
      </div>
      {/* Market details */}
      <div className="flex items-center gap-2">
        <div className="flex -space-x-2 items-center">
          {!vault?.market?.quote?.symbol || !vault?.market?.base?.symbol ? (
            <>
              <Skeleton className={cn("h-16 w-16", "rounded-full")} />
              <Skeleton className={cn("h-16 w-16", "rounded-full")} />
            </>
          ) : (
            <>
              <TokenIcon
                symbol={vault?.market?.base?.symbol}
                imgClasses="h-16 w-16"
              />

              <TokenIcon
                symbol={vault?.market?.quote?.symbol}
                imgClasses="h-16 w-16"
              />
            </>
          )}
        </div>
        <div className="grid items-center">
          {!vault?.market?.quote?.symbol || !vault?.market?.base?.symbol ? (
            <Skeleton className={cn("h-7 w-7", "rounded-full")} />
          ) : (
            <Title>{`${vault?.market?.quote?.symbol} - ${vault?.market?.base?.symbol}`}</Title>
          )}
          <div className="flex gap-2">
            <Subline
              title={"Chain"}
              value={chain?.name}
              icon={getChainImage(chain?.id, chain?.name)}
            />

            <Separator className="h-4 self-center" orientation="vertical" />
            <Subline
              title={"Strategy"}
              value={vault?.type}
              icon={
                <div className="relative h-4 w-4">
                  <div className="absolute inset-0 bg-green-700 rounded-full"></div>
                  <CheckIcon className="absolute inset-0 h-3 w-3 m-auto text-white" />
                </div>
              }
            />

            <Separator className="h-4 self-center" orientation="vertical" />
            <Subline title={"Manager"} value={vault?.manager} />
          </div>
        </div>
      </div>

      <div className="grid grid-flow-col mt-5 gap-5">
        <div className="col-span-2 w-full space-y-6">
          {/* Infos Card */}
          <div className="xs:grid md:flex p-5 justify-between rounded-lg bg-gradient-to-b from-bg-secondary to-bg-primary">
            <GridLine
              title={"TVL"}
              value={
                Number(
                  formatUnits(
                    vault?.tvl || 0n,
                    vault?.market.quote.decimals || 18,
                  ),
                ).toFixed(vault?.market.quote.displayDecimals || 3) ?? "0"
              }
              symbol={` ${vault?.market.quote.symbol}`}
            />
            <GridLine title={"APY"} value={"9.00"} symbol={"%"} />
            <GridLine
              title={"Performance Fee"}
              value={vault?.performanceFee}
              symbol={"%"}
              info="Tooltip to be defined"
            />
          </div>

          {/* Description */}
          <div className="space-y-3">
            <Title variant={"title2"} className="text-text-primary ">
              Vault description
            </Title>
            <Caption className="font-axiforma text-text-secondary text-xs">
              {vault?.description}
            </Caption>

            <Accordion title="Read more">
              <Caption className="font-axiforma">
                {vault?.descriptionBonus}
              </Caption>
            </Accordion>
          </div>

          {/* Graphs  */}
          {/* ********TODO*********/}
          <div className="border-2 border-bg-tertiary p-6 rounded-lg h-96 w-full">
            Incoming graph...
          </div>

          {/* Vault details */}
          <div>
            <Title variant={"title2"} className="text-text-primary ">
              Vault details
            </Title>
            <div>
              <div className="xs:grid-cols-1 grid md:grid-cols-2 gap-4">
                <div>
                  <GridLine
                    title="Strategy"
                    value={vault?.strategyType}
                    icon={
                      <div className="relative h-4 w-4">
                        <div className="absolute inset-0 bg-green-700 rounded-full"></div>
                        <CheckIcon className="absolute inset-0 h-3 w-3 m-auto text-white" />
                      </div>
                    }
                  />
                  <GridLine
                    title="Chain"
                    value={chain?.name}
                    icon={getChainImage(chain?.id, chain?.name)}
                    iconFirst
                  />
                  <GridLine
                    title="Vault Manager"
                    value={vault?.manager}
                    icon={
                      <div className="flex gap-1 text-text-secondary">
                        <Globe className="h-4 w-4 cursor-pointer hover:text-text-placeholder" />
                        <Send className="h-4 w-4 cursor-pointer hover:text-text-placeholder" />
                        <Twitter className="h-4 w-4 cursor-pointer hover:text-text-placeholder" />
                        <Mail className="h-4 w-4 cursor-pointer hover:text-text-placeholder" />
                      </div>
                    }
                  />
                  <GridLine title="Vault Created on" value="March 2024" />
                </div>
                <div>
                  <GridLine
                    title="Performance Fee"
                    value={vault?.performanceFee}
                    symbol="%"
                    info="Tooltip to be defined"
                  />

                  <GridLine
                    title="Management Fee"
                    value={vault?.managementFee}
                    symbol="%"
                    info="Tooltip to be defined"
                  />

                  <GridLine
                    title="Vault Address"
                    value={shortenAddress(vault?.address || "")}
                    icon={
                      <SquareArrowOutUpRight className="h-4 w-4 cursor-pointer hover:text-text-placeholder" />
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row-span-4">
          <div className="grid gap-8">
            <NeonContainer>
              <div className="flex w-2/3 justify-between items-center ">
                <GridLine
                  title={"Your deposit"}
                  value={
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-xs flex gap-1">
                        {Number(
                          formatUnits(
                            vault?.userBaseBalance || 0n,
                            vault?.market.base.decimals || 18,
                          ),
                        ).toFixed(vault?.market.base.displayDecimals || 4)}
                        <span className="text-text-secondary text-xs">
                          {vault?.market.base.symbol}
                        </span>
                      </span>
                      <span className="text-xs flex gap-1">
                        {Number(
                          formatUnits(
                            vault?.userQuoteBalance || 0n,
                            vault?.market.quote.decimals || 18,
                          ),
                        ).toFixed(vault?.market.quote.displayDecimals || 4)}
                        <span className="text-text-secondary text-xs">
                          {vault?.market.quote.symbol}
                        </span>
                      </span>
                    </div>
                  }
                />
                <GridLine
                  title={"Your APY"}
                  value={"Incoming..."}
                  symbol={""}
                />
              </div>
            </NeonContainer>
            {/* <div className="flex border-2 border-text-brand rounded-xl p-4 shadow-[0_0_20px_rgba(0,255,0,0.3)] items-center align-middle">
             
            </div> */}
            <div className="grid space-y-5 bg-bg-secondary p-3 rounded-lg">
              <div className="w-full ">
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
              {action === Action.Deposit ? <DepositForm /> : <WithdrawForm />}
            </div>
          </div>

          <div className="grid gap-4 px-6 mt-6">
            <Title variant={"title3"}>My Position</Title>

            <div>
              <Caption className="text-text-secondary">Current Balance</Caption>
              <Line
                title={
                  <div className="flex gap-2">
                    <TokenIcon
                      symbol={vault?.market.base.symbol}
                      className="h-4 w-4"
                    />
                    <Caption className="text-text-secondary text-xs">
                      {vault?.market.base.symbol}
                    </Caption>
                  </div>
                }
                value={Number(
                  formatUnits(
                    vault?.userBaseBalance || 0n,
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
                    <Caption className="text-text-secondary text-xs">
                      {vault?.market.quote.symbol}
                    </Caption>
                  </div>
                }
                value={
                  Number(
                    formatUnits(
                      vault?.userQuoteBalance || 0n,
                      vault?.market.quote.decimals || 18,
                    ),
                  ).toLocaleString(undefined, {
                    maximumFractionDigits:
                      vault?.market.quote.displayDecimals || 3,
                  }) || "0"
                }
              />
              <Caption className="text-text-secondary mt-5">
                Amount minted
              </Caption>

              <Line
                title={
                  <div className="flex gap-2">
                    <TokenIcon symbol={vault?.symbol} className="h-4 w-4" />
                    <Caption className="text-text-secondary text-xs">
                      {vault?.symbol}
                    </Caption>
                  </div>
                }
                value={
                  Number(
                    formatUnits(
                      vault?.mintedAmount || 0n,
                      vault?.decimals || 18,
                    ),
                  ).toLocaleString(undefined, {
                    maximumFractionDigits: 4,
                  }) || "0"
                }
              />
            </div>
          </div>

          <div className="grid gap-4 p-4 mt-6 border border-text-text-secondary rounded-lg">
            <Title variant={"title3"}>Rewards</Title>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex gap-2 items-center">
                <MangroveLogo className="w-16 h-16 flex justify-center items-center" />
                <Caption>Mangrove Rewards</Caption>
              </div>

              <div>
                <Line title={"Claimable"} value={"0.00"} />
                <Line title={"Earned"} value={"0.00"} />
                <Line title={"All time"} value={"0.00"} />
              </div>
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

const GridLine = ({
  title,
  value,
  symbol,
  info,
  icon,
  iconFirst,
}: {
  title: ReactNode
  value: ReactNode
  symbol?: ReactNode
  icon?: ReactNode
  iconFirst?: boolean
  info?: string
}) => {
  return (
    <div className="grid mt-2 items-center space-y-2">
      <div className="flex items-center -gap-1">
        <Caption className="text-text-secondary text-xs">{title}</Caption>
        {info ? (
          <InfoTooltip className="text-text-secondary" iconSize={14}>
            {info}
          </InfoTooltip>
        ) : undefined}
      </div>
      <div
        className={cn("flex items-center gap-2 ", {
          "flex-row-reverse justify-end": iconFirst,
        })}
      >
        <Text className="text-text-primary font-axiforma">
          {value}
          {symbol ? (
            <span className="text-text-tertiary">{symbol}</span>
          ) : undefined}
        </Text>
        <span className="text-text-secondary">{icon}</span>
      </div>
    </div>
  )
}

const Subline = ({
  title,
  value,
  icon,
}: {
  title: ReactNode
  value: ReactNode
  icon?: ReactNode
}) => {
  return (
    <div className="flex items-center gap-2">
      <Caption className="text-text-secondary text-xs"> {title}</Caption>
      <Caption className="text-text-primary text-xs">{value}</Caption>
      {icon ? icon : undefined}
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
