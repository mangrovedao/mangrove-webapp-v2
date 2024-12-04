"use client"

import {
  CheckIcon,
  ChevronRight,
  Globe,
  SquareArrowOutUpRight,
  Twitter,
} from "lucide-react"
import { useParams } from "next/navigation"

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
  const [action, setAction] = React.useState(Action.Deposit)
  const { chain } = useAccount()
  const params = useParams<{ address: string }>()

  const {
    data: { vault },
    refetch,
    isPending,
  } = useVault(params.address)

  const baseDepositDollar = vault?.baseDollarPrice
    ? Number(formatUnits(vault.userBaseBalance, vault.market.base.decimals)) *
      vault.baseDollarPrice
    : 0

  const quoteDepositDollar = vault?.quoteDollarPrice
    ? Number(formatUnits(vault.userQuoteBalance, vault.market.quote.decimals)) *
      vault.quoteDollarPrice
    : 0

  React.useEffect(() => {
    setTimeout(() => refetch?.(), 1)
  }, [refetch])

  return (
    <div className="max-w-7xl mx-auto px-3 pb-4">
      {/* BreadCrumb   */}

      <div className="flex items-center gap-2 pb-4 ml-4 ">
        <Link href={"/earn"} className="flex items-center gap-2">
          <Caption className="text-text-quaternary text-sm">Earn</Caption>
          <ChevronRight className="h-4 w-4 text-text-disabled" />
        </Link>
        <Caption className="text-text-secondary text-sm">Vault details</Caption>
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
            <Title className="!text-3xl">{`${vault?.market?.base?.symbol}-${vault?.market?.quote?.symbol}`}</Title>
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
          <div className="mx-1 flex p-5 justify-between rounded-lg bg-gradient-to-b from-bg-secondary to-bg-primary flex-wrap">
            <GridLineHeader
              title={"TVL"}
              value={
                vault?.tvl
                  ? (
                      Number(
                        formatUnits(
                          vault?.tvl || 0n,
                          vault?.market.quote.decimals || 18,
                        ),
                      ) * (vault?.quoteDollarPrice ?? 1)
                    ).toFixed(vault?.market.quote.displayDecimals || 3)
                  : "0"
              }
              symbol={` $`}
            />
            <GridLineHeader
              title={"APY"}
              value={vault?.apr ? vault?.apr.toFixed(2) : "0"}
              symbol={"%"}
            />
            <GridLineHeader
              title={"Performance fee"}
              value={vault?.performanceFee}
              symbol={"%"}
              info="A fee based on the profits generated from your deposit."
            />
          </div>

          {/* Description */}

          <div className="mx-5 space-y-3">
            <Title variant={"title1"} className="text-text-primary ">
              Vault description
            </Title>
            {vault?.description ? (
              <>
                <Text className="font-axiforma text-text-secondary text-sm">
                  {vault?.description?.split("\n").map((line, i) => (
                    <React.Fragment key={i}>
                      {line.startsWith("- ") ? (
                        <li className="list-disc ml-4">{line.substring(2)}</li>
                      ) : line.includes(":") ? (
                        <>
                          <Title
                            variant={"title3"}
                            className="text-text-primary"
                          >
                            {line.split(":")[0]}
                          </Title>
                        </>
                      ) : (
                        line
                      )}
                    </React.Fragment>
                  ))}
                </Text>

                <Accordion title="Read more">
                  <Text
                    className="font-axiforma text-text-secondary mt-2"
                    variant={"text2"}
                  >
                    {vault?.descriptionBonus?.split("\n").map((line, i) => (
                      <React.Fragment key={i}>
                        {line.startsWith("- ") ? (
                          <li className="list-disc ml-4">
                            {line.substring(2)}
                          </li>
                        ) : line.includes(":") ? (
                          <>
                            <Title
                              variant={"title3"}
                              className="text-text-primary"
                            >
                              {line.split(":")[0]}
                            </Title>
                          </>
                        ) : (
                          line
                        )}
                        <br />
                      </React.Fragment>
                    ))}
                  </Text>
                </Accordion>
              </>
            ) : (
              <Skeleton className="h-20 w-full" />
            )}
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
          <div className="mx-5">
            <Title className="text-text-primary text-lg">Vault details</Title>
            {vault ? (
              <div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
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
                      title="Vault Manager"
                      value={vault?.manager}
                      icon={
                        <div className="flex gap-1 text-text-secondary">
                          <Link
                            href={vault?.socials.website || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Globe className="h-4 w-4 cursor-pointer hover:text-text-placeholder" />
                          </Link>
                          {/* <Send className="h-4 w-4 cursor-pointer hover:text-text-placeholder" /> */}
                          <Link
                            href={vault?.socials.x || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Twitter className="h-4 w-4 cursor-pointer hover:text-text-placeholder" />
                          </Link>
                          {/* <Mail className="h-4 w-4 cursor-pointer hover:text-text-placeholder" /> */}
                        </div>
                      }
                    />
                  </div>
                  <div>
                    <GridLine
                      title="Performance Fee"
                      value={vault?.performanceFee}
                      symbol="%"
                      info="A fee based on the profits generated from your deposit."
                    />
                    <GridLine
                      title="Chain"
                      value={chain?.name}
                      icon={getChainImage(chain?.id, chain?.name)}
                      iconFirst
                    />
                  </div>
                  <div>
                    <GridLine
                      title="Vault Address"
                      value={shortenAddress(vault?.address || "")}
                      href={`${chain?.blockExplorers?.default.url}/address/${vault?.address}`}
                      icon={
                        <SquareArrowOutUpRight className="h-4 w-4 cursor-pointer hover:text-text-placeholder" />
                      }
                    />

                    <GridLine
                      title="Vault Created on"
                      value={"November 2024"}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <Skeleton className="h-20 w-full mt-5" />
            )}
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
              <div className="flex justify-start items-center gap-5">
                <GridLine
                  title={"Your deposit"}
                  value={
                    <div className="flex items-center justify-center gap-2 text-2xl font-axiforma">
                      <span className="flex gap-1">
                        {(baseDepositDollar + quoteDepositDollar).toFixed(2)}
                        <span className="text-text-secondary">$</span>
                      </span>
                    </div>
                  }
                />
                <GridLine
                  title={"Your APY"}
                  value={
                    <span className="text-2xl flex gap-1 font-axiforma">
                      Incoming...
                    </span>
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
            <Title className="text-xl">My Position</Title>

            <div>
              <Caption className="text-text-secondary !text-base">
                Current Balance
              </Caption>
              <Line
                title={
                  <div className="flex gap-2">
                    <TokenIcon
                      symbol={vault?.market.base.symbol}
                      className="h-4 w-4"
                    />
                    <Caption className="text-text-secondary !text-sm">
                      {vault?.market.base.symbol}
                    </Caption>
                  </div>
                }
                value={
                  Number(
                    formatUnits(
                      vault?.userBaseBalance || 0n,
                      vault?.market.base.decimals || 18,
                    ),
                  ).toLocaleString(undefined, {
                    maximumFractionDigits:
                      vault?.market.base.displayDecimals || 3,
                  }) || "0"
                }
              />
              <Line
                title={
                  <div className="flex gap-2">
                    <TokenIcon
                      symbol={vault?.market.quote.symbol}
                      className="h-4 w-4"
                    />
                    <Caption className="text-text-secondary !text-sm">
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
              <Caption className="text-text-secondary mt-5 !text-base">
                Minted amount
              </Caption>

              <Line
                title={
                  <div className="flex gap-2">
                    <TokenIcon symbol={vault?.symbol} className="h-4 w-4" />
                    <Caption className="text-text-secondary text-sm">
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

          <div className="z-20 grid gap-4 p-4 mt-6 border border-text-text-secondary rounded-lg ">
            <Title className="text-lg">Rewards</Title>
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

              <div className="flex flex-col gap-1">
                <LineRewards title={"Claimable"} value={"0.00"} />
                <LineRewards title={"Earned"} value={"0.00"} />
                <LineRewards title={"All time"} value={"0.00"} />
              </div>
            </div>
            <Button
              variant={"primary"}
              size={"lg"}
              className="w-full"
              disabled={true}
            >
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
  href,
}: {
  title: ReactNode
  value: ReactNode
  symbol?: ReactNode
  icon?: ReactNode
  iconFirst?: boolean
  info?: string
  href?: string
}) => {
  return (
    <div className="grid items-center mt-2">
      <div className="flex items-center -gap-1">
        <Caption className="text-text-secondary !text-sm">{title}</Caption>
        {info ? (
          <InfoTooltip className="text-text-secondary" iconSize={14}>
            {info}
          </InfoTooltip>
        ) : undefined}
      </div>
      {value ? (
        <>
          <div
            className={cn("flex items-center gap-2 ", {
              "flex-row-reverse justify-end": iconFirst,
            })}
          >
            <Text className="text-text-primary font-axiforma !text-base">
              {value}
              {symbol ? (
                <span className="text-text-tertiary">{symbol}</span>
              ) : undefined}
            </Text>
            {href ? (
              <Link
                href={href || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-secondary"
              >
                {icon}
              </Link>
            ) : (
              <span className="text-text-secondary">{icon}</span>
            )}
          </div>
        </>
      ) : (
        <Skeleton className="h-10 w-full" />
      )}
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
        <Title className="text-text-secondary font-light text-md">
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
        {value ? (
          <>
            <Title className="text-text-primary !text-3xl">
              {value}
              {symbol ? (
                <span className="text-text-tertiary">{symbol}</span>
              ) : undefined}
            </Title>
            <span className="text-text-secondary">{icon}</span>
          </>
        ) : (
          <Skeleton className="h-10 w-full" />
        )}
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
      <Caption className="text-text-secondary !text-sm"> {title}</Caption>
      <Caption className="text-text-primary !text-sm">{value}</Caption>
      {icon ? icon : undefined}
    </div>
  )
}
