"use client"

import { AnimatePresence, motion } from "framer-motion"
import {
  AlertTriangle,
  CheckIcon,
  ChevronRight,
  Globe,
  SquareArrowOutUpRight,
  Twitter,
} from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import React, { ReactNode, useEffect, useState } from "react"
import { Address, formatUnits } from "viem"

import {
  CustomRadioGroup,
  CustomRadioGroupItem,
} from "@/components/custom-radio-group-new"
import InfoTooltip from "@/components/info-tooltip-new"
import { TokenIcon } from "@/components/token-icon-new"
import { Caption } from "@/components/typography/caption"
import { Text } from "@/components/typography/text"
import { Title } from "@/components/typography/title"
import { Button } from "@/components/ui/button"
import { Drawer } from "@/components/ui/drawer"
import { Skeleton } from "@/components/ui/skeleton"
import { useDefaultChain } from "@/hooks/use-default-chain"
import { TradeIcon } from "@/svgs"
import { cn } from "@/utils"
import { formatNumber } from "@/utils/numbers"
import { shortenAddress } from "@/utils/wallet"
import { useVaults } from "../(list)/_components/tables/vaults/hooks/use-vaults"
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
  const params = useParams<{ address: Address }>()

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

  useVaults({ vaultAddress: params.address })

  const {
    data: { vault },
    refetch,
  } = useVault(params.address)

  useEffect(() => {
    if (vault?.isDeprecated) {
      setAction(Action.Withdraw)
    }
  }, [vault])

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
      <div>
        {vault?.isDeprecated && (
          <motion.div
            className="bg-yellow-900/20 border border-yellow-600/30 rounded-md p-4 mb-6 mx-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-yellow-500 font-medium mb-1">
                  Deprecated Vault
                </h3>
                <p className="text-sm text-text-secondary">
                  This vault is deprecated and only withdrawals are allowed. A
                  new version will be deployed soon.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
      {/* BreadCrumb */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-2 mb-1 ml-4"
      >
        <Link
          href={"/earn"}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <Caption className="text-text-quaternary text-sm">Earn</Caption>
          <ChevronRight className="h-4 w-4 text-text-disabled" />
        </Link>
        <Caption className="text-text-secondary text-sm">Vault details</Caption>
      </motion.div>

      {/* Market details */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex items-center gap-2 flex-wrap ml-4"
      >
        <div className="grid items-center gap-2">
          {!vault?.market?.quote?.symbol || !vault?.market?.base?.symbol ? (
            <Skeleton className={cn("h-7 w-7", "rounded-sm")} />
          ) : (
            <motion.div
              className="flex items-center gap-2"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <div className="flex -space-x-2 items-center">
                {!vault?.market?.quote?.symbol ||
                !vault?.market?.base?.symbol ? (
                  <>
                    <Skeleton className={cn("h-16 w-16", "rounded-sm")} />
                    <Skeleton className={cn("h-16 w-16", "rounded-sm")} />
                  </>
                ) : (
                  <>
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <TokenIcon
                        symbol={vault?.market?.base?.symbol}
                        imgClasses="h-10 w-10 drop-shadow-lg"
                      />
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.1, rotate: -5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <TokenIcon
                        symbol={vault?.market?.quote?.symbol}
                        imgClasses="h-10 w-10 drop-shadow-lg"
                      />
                    </motion.div>
                  </>
                )}
              </div>
              <Title className="!text-2xl bg-clip-text text-white">{`${vault?.market?.base?.symbol}-${vault?.market?.quote?.symbol}`}</Title>
            </motion.div>
          )}

          <div className="flex gap-3 flex-wrap">
            <Subline
              title={"Chain"}
              value={defaultChain?.name}
              icon={getChainImage(defaultChain)}
            />
            <Subline
              title={"Performance Fee"}
              value={`${vault?.performanceFee}%`}
            />
            <Subline title={"Manager"} value={vault?.manager} />
          </div>
        </div>
      </motion.div>

      {/* Main Columns */}
      <div className="grid grid-cols-1 md:grid-cols-12 mt-5 gap-5">
        <motion.div
          className="col-span-12 md:col-span-8 space-y-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Infos Card */}
          <motion.div
            className="mx-1 flex p-4 justify-between rounded-sm flex-wrap box-shadow-lg"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            style={{ boxShadow: "0 0 15px 0 rgba(0, 255, 170, 0.1)" }}
          >
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
            <GridLineHeader title={"Strategy"} value={vault?.strategyType} />
          </motion.div>

          {/* Description */}
          <motion.div
            className="mx-5 space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Title variant={"title1"} className="text-text-primary">
              Vault description
            </Title>
            {vault?.description ? (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                >
                  <Text className="text-text-secondary text-sm font-axiforma">
                    {vault?.description?.split("\n").map((line, i) => (
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
                      </React.Fragment>
                    ))}
                  </Text>
                </motion.div>
              </>
            ) : (
              <Skeleton className="h-20 w-full" />
            )}
          </motion.div>

          {/* Graphs */}
          <motion.div
            className="flex justify-center items-center mx-5"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.5,
              delay: 0.6,
              type: "spring",
              stiffness: 100,
            }}
            whileHover={{ scale: 1.01 }}
          >
            {/* <ImageWithHideOnError
              src={`/assets/illustrations/vault-graph-placeholder.png`}
              width={832}
              height={382}
              alt={`vault-graph-placeholder`}
              className="rounded-sm shadow-lg"
            /> */}
          </motion.div>

          {/* Vault details */}
          <motion.div
            className="mx-5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.7 }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.6 }}
              className="mb-8"
            >
              <Accordion title="Read more">
                <Text
                  className="text-text-secondary mt-2 font-axiforma text-sm"
                  variant={"text2"}
                >
                  {vault?.descriptionBonus?.split("\n").map((line, i) => (
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
                      <br />
                    </React.Fragment>
                  ))}
                </Text>
              </Accordion>
            </motion.div>
            <Title className="text-text-primary text-lg">Vault details</Title>
            {vault ? (
              <div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <GridLine
                      title="Strategy"
                      value={vault?.strategyType}
                      icon={
                        <motion.div
                          className="relative h-4 w-4"
                          whileHover={{ scale: 1.2 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="absolute inset-0 bg-green-700 rounded-sm"></div>
                          <CheckIcon className="absolute inset-0 h-3 w-3 m-auto text-white" />
                        </motion.div>
                      }
                    />

                    <GridLine
                      title="Vault Manager"
                      value={vault?.manager}
                      icon={
                        <div className="flex gap-1 text-text-secondary">
                          <motion.div
                            whileHover={{ scale: 1.2, rotate: 5 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Link
                              href={vault?.socials.website || "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Globe className="h-4 w-4 cursor-pointer hover:text-text-placeholder" />
                            </Link>
                          </motion.div>
                          <motion.div
                            whileHover={{ scale: 1.2, rotate: 5 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Link
                              href={vault?.socials.x || "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Twitter className="h-4 w-4 cursor-pointer hover:text-text-placeholder" />
                            </Link>
                          </motion.div>
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
                        <motion.div
                          whileHover={{ scale: 1.2, rotate: 5 }}
                          transition={{ duration: 0.2 }}
                        >
                          <SquareArrowOutUpRight className="h-4 w-4 cursor-pointer hover:text-text-placeholder" />
                        </motion.div>
                      }
                    />

                    <GridLine title="Vault Created on" value={"June 2025"} />
                  </div>
                </div>
              </div>
            ) : (
              <Skeleton className="h-20 w-full mt-5" />
            )}
          </motion.div>
        </motion.div>

        <motion.div
          className="col-span-12 md:col-span-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="grid gap-8">
            {/* Only show the form directly on desktop */}
            {!isMobile && (
              <motion.div
                className="grid space-y-5 bg-bg-secondary p-3 rounded-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 }}
                style={{ boxShadow: "0 0 15px 0 rgba(0, 255, 170, 0.1)" }}
              >
                {!vault ? (
                  <>
                    <Skeleton className="h-10 mb-4 w-full" />
                    <Skeleton className="h-[200px] w-full bg-bg-primary" />
                  </>
                ) : (
                  <>
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
                            disabled={
                              action === Action.Deposit && vault?.isDeprecated
                            }
                            value={action}
                            id={action}
                            className="capitalize"
                          >
                            {action}
                          </CustomRadioGroupItem>
                        ))}
                      </CustomRadioGroup>
                    </div>
                    <div className="relative min-h-[400px] h-full">
                      <AnimatePresence mode="wait">
                        {action === Action.Deposit && !vault?.isDeprecated ? (
                          <motion.div
                            key="deposit-form"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{
                              type: "spring",
                              stiffness: 300,
                              damping: 30,
                            }}
                            className="absolute inset-0"
                          >
                            <DepositForm />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="withdraw-form"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{
                              type: "spring",
                              stiffness: 300,
                              damping: 30,
                            }}
                            className="absolute inset-0"
                          >
                            <WithdrawForm />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </div>

          <motion.div
            className="grid gap-4 px-6 mt-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.7 }}
          >
            <Title className="text-xl">My Position</Title>

            <div>
              <Caption className="text-text-secondary !text-base">
                Current Balance
              </Caption>
              <Line
                title={
                  <div className="flex gap-2">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <TokenIcon
                        symbol={vault?.market.base.symbol}
                        className="h-4 w-4"
                        imgClasses="w-5 h-5"
                      />
                    </motion.div>
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
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <TokenIcon
                        symbol={vault?.market.quote.symbol}
                        className="h-4 w-4"
                        imgClasses="w-5 h-5"
                      />
                    </motion.div>
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
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Floating Action Button - shown on all screen sizes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
        className="fixed bottom-6 right-6 z-50 lg:hidden"
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
            <div className="relative">
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
            <Text className="text-text-primary !text-base font-axiforma">
              {value}
              {symbol ? (
                <span className="text-text-tertiary font-axiforma">
                  {symbol}
                </span>
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
        <>
          <Title className="text-text-primary !text-md">
            {value}
            {symbol ? (
              <span className="text-text-tertiary">{symbol}</span>
            ) : undefined}
          </Title>
          <span className="text-text-secondary">{icon}</span>
        </>
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
