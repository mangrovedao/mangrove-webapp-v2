"use client"

import {
  CheckIcon,
  ChevronRight,
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
import { Button } from "@/components/ui/button"
import { ImageWithHideOnError } from "@/components/ui/image-with-hide-on-error"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/utils"
import { shortenAddress } from "@/utils/wallet"
import Link from "next/link"
import React, { ReactNode } from "react"
import { formatUnits } from "viem"
import { useAccount } from "wagmi"
import { Line, LineRewards, getChainImage } from "../(shared)/utils"
import { useVault } from "./_hooks/use-vault"
import { Accordion } from "./form/components/accordion"
import { DepositForm } from "./form/deposit-form"
import { WithdrawForm } from "./form/withdraw-form"

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
    <div className="max-w-7xl mx-auto lg:px-3 pb-4">
      {/* BreadCrumb   */}

      <div className="flex items-center gap-2 pb-4 ml-4">
        <Link href={"/earn"} className="flex items-center gap-2">
          <Caption className="text-text-quaternary">Earn</Caption>
          <ChevronRight className="h-4 w-4 text-text-disabled" />
        </Link>
        <Caption className="text-text-secondary">Vault details</Caption>
      </div>
      {/* Market details */}
      <div className="flex items-center gap-2 flex-wrap ml-4">
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
        <div className="grid items-center ">
          {!vault?.market?.quote?.symbol || !vault?.market?.base?.symbol ? (
            <Skeleton className={cn("h-7 w-7", "rounded-full")} />
          ) : (
            <Title>{`${vault?.market?.quote?.symbol} - ${vault?.market?.base?.symbol}`}</Title>
          )}
          <div className="flex gap-2 flex-wrap">
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

      {/* Main Columns */}
      <div className="grid grid-cols-1 md:grid-cols-12 mt-5 gap-5 ">
        <div className="col-span-12 md:col-span-8 space-y-6">
          {/* Infos Card */}
          <div className="mx-1 grid sm:flex p-5 justify-between rounded-lg bg-gradient-to-b from-bg-secondary to-bg-primary flex-wrap">
            <GridLineHeader
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
            <GridLineHeader title={"APY"} value={"9.00"} symbol={"%"} />
            <GridLineHeader
              title={"Performances fees"}
              value={vault?.performanceFee}
              symbol={"%"}
              info="Tooltip to be defined"
            />
          </div>

          {/* Description */}
          <div className="mx-5 space-y-3">
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
          <div className="flex justify-center items-center">
            <ImageWithHideOnError
              src={`/assets/illustrations/vault-graph-placeholder.png`}
              width={832}
              height={382}
              alt={`vault-graph-placeholder`}
            />
          </div>

          {/* Vault details */}
          <div className="mx-5 ">
            <Title variant={"title2"} className="text-text-primary ">
              Vault details
            </Title>
            <div>
              <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-4">
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
                </div>
                <div>
                  <GridLine
                    title="Performance Fee"
                    value={vault?.performanceFee}
                    symbol="%"
                    info="Tooltip to be defined"
                  />

                  <GridLine
                    title="Strategy Address"
                    value={shortenAddress(vault?.address || "")}
                    icon={
                      <SquareArrowOutUpRight className="h-4 w-4 cursor-pointer hover:text-text-placeholder" />
                    }
                  />

                  <GridLine
                    title="Vault Address"
                    value={shortenAddress(vault?.address || "")}
                    icon={
                      <SquareArrowOutUpRight className="h-4 w-4 cursor-pointer hover:text-text-placeholder" />
                    }
                  />
                </div>
                <div>
                  <GridLine
                    title="Management Fee"
                    value={vault?.managementFee}
                    symbol="%"
                    info="Tooltip to be defined"
                  />

                  <GridLine
                    title="Audit"
                    value={"Website"}
                    icon={
                      <SquareArrowOutUpRight className="h-4 w-4 cursor-pointer hover:text-text-placeholder" />
                    }
                  />

                  <GridLine title="Vault Created on" value={"March 2024"} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 md:col-span-4">
          <div className="grid gap-8">
            <NeonContainer className="relative">
              <ImageWithHideOnError
                className="absolute -top-[17px] -right-[17px] rounded-xl"
                src={`/assets/illustrations/earn-leaf.png`}
                width={100}
                height={90}
                alt={`mangrove-logo`}
              />
              <div className="flex w-2/3 justify-between items-center">
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
                  value={
                    <span className="text-xs flex gap-1">Incoming...</span>
                  }
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
                Minted amount
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

          <div className="z-20 grid gap-4 p-4 mt-6 border border-text-text-secondary rounded-lg">
            <Title variant={"title3"}>Rewards</Title>
            <div className="grid xs:grid-cols-1 grid-cols-2 gap-4">
              <div className="flex gap-2 items-start">
                <div className="flex items-center gap-2">
                  <ImageWithHideOnError
                    src={`/assets/illustrations/mangrove-logo.png`}
                    width={24}
                    height={26}
                    key={`mangrove-logo`}
                    alt={`mangrove-logo`}
                  />
                  <Caption className="text-text-secondary">MGV</Caption>
                </div>
              </div>

              <div>
                <LineRewards title={"Claimable"} value={"0.00"} />
                <LineRewards title={"Earned"} value={"0.00"} />
                <LineRewards title={"All time"} value={"0.00"} />
              </div>
            </div>
            <Button variant={"primary"} size={"lg"} className="w-full">
              Claim rewards
            </Button>
          </div>
        </div>
      </div>
    </div>
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
    <div className="grid items-center mt-2">
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
        <Text className="text-text-primary font-axiforma !text-sm">
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

const GridLineHeader = ({
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
        <Title
          className="text-text-secondary font-unbuntuLight"
          variant={"title3"}
        >
          {title}
        </Title>
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
        <Title className="text-text-primary font-axiforma text-md">
          {value}
          {symbol ? (
            <span className="text-text-tertiary">{symbol}</span>
          ) : undefined}
        </Title>
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
