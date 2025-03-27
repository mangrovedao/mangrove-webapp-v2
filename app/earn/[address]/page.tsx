"use client"

import { AnimatePresence, motion } from "framer-motion"
import {
  CheckIcon,
  ChevronRight,
  Globe,
  SquareArrowOutUpRight,
  Twitter,
} from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import React, { ReactNode, useEffect, useState } from "react"
import { formatUnits } from "viem"

import {
  CustomRadioGroup,
  CustomRadioGroupItem,
} from "@/components/custom-radio-group-new"
import { FlowingNumbers } from "@/components/flowing-numbers"
import InfoTooltip from "@/components/info-tooltip-new"
import NeonContainer from "@/components/neon-container"
import { TokenIcon } from "@/components/token-icon-new"
import { Caption } from "@/components/typography/caption"
import { Text } from "@/components/typography/text"
import { Title } from "@/components/typography/title"
import { Button } from "@/components/ui/button"
import { Drawer } from "@/components/ui/drawer"
import { ImageWithHideOnError } from "@/components/ui/image-with-hide-on-error"
import { Skeleton } from "@/components/ui/skeleton"
import { useDefaultChain } from "@/hooks/use-default-chain"
import { TradeIcon } from "@/svgs"
import { cn } from "@/utils"
import { formatNumber } from "@/utils/numbers"
import { shortenAddress } from "@/utils/wallet"
import { Line, getChainImage } from "../(shared)/utils"
import { useVault } from "./_hooks/use-vault"
import { Accordion } from "./form/components/accordion"
import { DepositForm } from "./form/deposit-form"
import { WithdrawForm } from "./form/withdraw-form"

enum Action {
  Deposit = "Deposit",
  Withdraw = "Withdraw",
}

export default function Page() {
  const { defaultChain } = useDefaultChain()
  const [action, setAction] = React.useState(Action.Deposit)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const params = useParams<{ address: string }>()

  // Check if we're on mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024) // lg breakpoint
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)

    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

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

      <div className="flex items-center gap-2 mb-1 ml-4">
        <Link href={"/earn"} className="flex items-center gap-2">
          <Caption className="text-text-quaternary text-sm">Earn</Caption>
          <ChevronRight className="h-4 w-4 text-text-disabled" />
        </Link>
        <Caption className="text-text-secondary text-sm">Vault details</Caption>
      </div>
      {/* Market details */}
      <div className="flex items-center gap-2 flex-wrap ml-4">
        <div className="grid items-center gap-2 ">
          {!vault?.market?.quote?.symbol || !vault?.market?.base?.symbol ? (
            <Skeleton className={cn("h-7 w-7", "rounded-sm")} />
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2 items-center">
                {!vault?.market?.quote?.symbol ||
                !vault?.market?.base?.symbol ? (
                  <>
                    <Skeleton className={cn("h-16 w-16", "rounded-sm")} />
                    <Skeleton className={cn("h-16 w-16", "rounded-sm")} />
                  </>
                ) : (
                  <>
                    <TokenIcon
                      symbol={vault?.market?.base?.symbol}
                      imgClasses="h-10 w-10"
                    />

                    <TokenIcon
                      symbol={vault?.market?.quote?.symbol}
                      imgClasses="h-10 w-10"
                    />
                  </>
                )}
              </div>

              <Title className="!text-2xl">{`${vault?.market?.base?.symbol}-${vault?.market?.quote?.symbol}`}</Title>
            </div>
          )}
          <div className="flex gap-3 flex-wrap ">
            <Subline
              title={"Chain"}
              value={defaultChain?.name}
              icon={getChainImage(defaultChain)}
            />
            <Subline title={"Strategy"} value={vault?.type} />
            <Subline title={"Manager"} value={vault?.manager} />
          </div>
        </div>
      </div>

      {/* Main Columns */}
      <div className="grid grid-cols-1 md:grid-cols-12 mt-5 gap-5 ">
        <div className="col-span-12 md:col-span-8 space-y-6">
          {/* Infos Card */}
          <div className="mx-1 flex p-4 justify-between rounded-sm  flex-wrap">
            <GridLineHeader
              title={"TVL"}
              value={formatNumber(
                Number(
                  formatUnits(
                    vault?.tvl || 0n,
                    vault?.market.quote.decimals || 18,
                  ),
                ) * (vault?.quoteDollarPrice ?? 1),
              )}
              symbol={` $`}
            />

            <GridLineHeader
              title={"APR"}
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
                          <div className="absolute inset-0 bg-green-700 rounded-sm"></div>
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
                      value={defaultChain?.name}
                      icon={getChainImage(defaultChain)}
                      iconFirst
                    />
                  </div>
                  <div>
                    <GridLine
                      title="Vault Address"
                      value={shortenAddress(vault?.address || "")}
                      href={`${defaultChain?.blockExplorers?.default.url}/address/${vault?.address}`}
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
                className="absolute -top-[24px] -right-[17px] rounded-sm"
                src={`/assets/illustrations/earn-leaf.png`}
                width={100}
                height={90}
                alt={`mangrove-logo`}
              />
              <GridLine
                title={"Your incentives rewards"}
                value={
                  <div className="flex items-center gap-1">
                    <span className="text-text-secondary !text-md">MGV</span>
                    <FlowingNumbers
                      className="text-md"
                      initialValue={vault?.incentivesData?.rewards || 0}
                      ratePerSecond={
                        vault?.incentivesData?.currentRewardsPerSecond || 0
                      }
                      decimals={6}
                    />
                  </div>
                }
              />
              <div className="flex justify-start items-center gap-5">
                <GridLine
                  title={"Your deposit"}
                  value={
                    <div className="flex items-center justify-center gap-2 text-md">
                      <span className="flex gap-1 text-md">
                        {(baseDepositDollar + quoteDepositDollar).toFixed(2)}
                        <span className="text-text-secondary">$</span>
                      </span>
                    </div>
                  }
                />
                <GridLine
                  title={"Your PNL"}
                  value={
                    <span className="flex gap-1 text-md">
                      {vault?.pnlData?.pnl
                        ? `${vault?.pnlData?.pnl.toFixed(2)}%`
                        : "0"}
                    </span>
                  }
                  symbol={""}
                />
              </div>
            </NeonContainer>
            {/* <div className="flex border-2 border-text-brand rounded-xl p-4 shadow-[0_0_20px_rgba(0,255,0,0.3)] items-center align-middle">
             
            </div> */}
            {/* Only show the form directly on desktop */}
            {!isMobile && (
              <div className="grid space-y-5 bg-bg-secondary p-3 rounded-sm">
                <div className="w-full">
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
                <div className="relative min-h-[400px]">
                  <AnimatePresence mode="wait">
                    {action === Action.Deposit ? (
                      <motion.div
                        key="deposit-form"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0"
                      >
                        <DepositForm />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="withdraw-form"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0"
                      >
                        <WithdrawForm />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
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
                      imgClasses="w-5 h-5"
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
                      imgClasses="w-5 h-5"
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
                    <TokenIcon
                      symbol={vault?.symbol}
                      className="h-4 w-4"
                      imgClasses="w-5 h-5"
                    />
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
        </div>
      </div>

      {/* Floating Action Button - shown on all screen sizes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
        className="fixed bottom-6 right-6 z-50 md:hidden"
      >
        <Button
          className="flex items-center justify-center rounded-full bg-bg-tertiary hover:bg-bg-primary-hover"
          onClick={() => setIsDrawerOpen(true)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={action}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center"
            >
              <TradeIcon className="w-8 h-8 p-1 text-text-secondary" />
            </motion.div>
          </AnimatePresence>
        </Button>
      </motion.div>

      {/* Drawer for Action Selection and Form */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <Drawer.Content className="h-[80vh] p-4 bg-bg-primary">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-1 bg-bg-tertiary rounded-sm" />
          </div>
          <Title className="text-2xl mb-4 text-center">
            {action === Action.Deposit ? "Deposit" : "Withdraw"}
          </Title>
          <div className="space-y-6">
            <div className="w-full">
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
            <div className="relative min-h-[400px]">
              <AnimatePresence mode="wait">
                {action === Action.Deposit ? (
                  <motion.div
                    key="deposit-form-drawer"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0"
                  >
                    <DepositForm />
                  </motion.div>
                ) : (
                  <motion.div
                    key="withdraw-form-drawer"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0"
                  >
                    <WithdrawForm />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </Drawer.Content>
      </Drawer>
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
    <div className="grid items-center gap-2">
      <div className="flex items-center">
        <Title
          className="text-text-secondary font-light text-sm"
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
        className={cn("flex items-center -mt-2", {
          "flex-row-reverse justify-end": iconFirst,
        })}
      >
        {value ? (
          <>
            <Title className="text-text-primary !text-md">
              {value}
              {symbol ? (
                <span className="text-text-tertiary">{symbol}</span>
              ) : undefined}
            </Title>
            <span className="text-text-secondary">{icon}</span>
          </>
        ) : (
          <Skeleton className="h-5 w-full" />
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
    <div className="flex items-center gap-1">
      <Caption className="text-text-secondary !text-xs"> {title}</Caption>
      <Caption className="text-text-primary !text-xs">{value}</Caption>
      {icon ? icon : undefined}
    </div>
  )
}
