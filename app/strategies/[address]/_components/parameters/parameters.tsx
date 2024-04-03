"use client"

import Big from "big.js"
import Link from "next/link"
import React from "react"
import { useAccount } from "wagmi"

import InfoTooltip from "@/components/info-tooltip"
import { Caption } from "@/components/typography/caption"
import { Text } from "@/components/typography/text"
import { Title } from "@/components/typography/title"
import { Skeleton } from "@/components/ui/skeleton"

import { Button } from "@/components/ui/button"
import PriceRangeInfos from "../shared/price-range-infos"
import { Bounty } from "./dialogs/bounty"
import { Withdraw } from "./dialogs/withdraw"
import { useParameters } from "./hook/use-parameters"

const InfoLine = ({
  title,
  value,
}: {
  title: string
  value?: React.ReactNode
}) => {
  return (
    <div>
      <Caption className="text-muted-foreground">{title}</Caption>
      {value ? <Text variant={"text2"}>{value}</Text> : <Skeleton />}
    </div>
  )
}

const InfoBar = () => {
  const { currentParameter, quote } = useParameters()

  return (
    <div className=" flex justify-between bg-blend-darken rounded-lg">
      <InfoLine
        title="Nb. of offers"
        value={Number(currentParameter?.length) - 1}
      />
      <InfoLine title="Step size" value={currentParameter?.stepSize} />
      <InfoLine
        title="Min price"
        value={
          currentParameter?.minPrice
            ? `${currentParameter?.minPrice?.toFixed(quote?.displayedAsPriceDecimals)} ${quote?.symbol}`
            : "-"
        }
      />
      <InfoLine
        title="Max price"
        value={
          currentParameter?.maxPrice
            ? `${currentParameter?.maxPrice?.toFixed(quote?.displayedAsPriceDecimals)} ${quote?.symbol}`
            : "-"
        }
      />
    </div>
  )
}

const Inventory = () => {
  const { withdrawBase, withdrawQuote, base, quote } = useParameters()
  const [deposit, toggleDeposit] = React.useReducer((isOpen) => !isOpen, false)
  const [publish, togglePublish] = React.useReducer((isOpen) => !isOpen, false)
  const [withdraw, toggleWithdraw] = React.useReducer(
    (isOpen) => !isOpen,
    false,
  )

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between">
        <div className="flex items-center">
          <Title>Withdrawable balance</Title>
          <InfoTooltip>TODO:</InfoTooltip>
        </div>
        <div className="flex gap-2">
          {/* <Button onClick={toggleDeposit}>Deposit</Button> */}
          {/* <Button onClick={togglePublish} variant={"secondary"}>
            Publish
          </Button> */}
          <Button
            onClick={toggleWithdraw}
            variant={"secondary"}
            disabled={
              Number(withdrawBase ?? 0) <= 0 && Number(withdrawQuote ?? 0) <= 0
            }
          >
            Withdraw
          </Button>
        </div>
      </div>

      {/* Table */}
      <table className="w-full flex flex-col gap-2 mt-5 divide-y border-b pb-4">
        <thead>
          <tr className="flex justify-between">
            <Caption className="text-muted-foreground">Asset</Caption>
            <Caption className="text-muted-foreground">Amount</Caption>
          </tr>
        </thead>
        <tbody className="w-full flex flex-col gap-4 divide-y">
          <tr className="flex justify-between pt-4">
            <Text>{base?.symbol}</Text>
            <Text>
              {withdrawBase} {base?.symbol}
            </Text>
          </tr>
          <tr className="flex justify-between pt-4">
            <Text>{quote?.symbol}</Text>
            <Text>
              {withdrawQuote} {quote?.symbol}
            </Text>
          </tr>
        </tbody>
      </table>

      {/* Dialogs */}
      {/* <Deposit
        open={deposit}
        onClose={toggleDeposit}
        togglePublish={togglePublish}
      /> */}
      {/* <Publish open={publish} onClose={togglePublish} /> */}
      <Withdraw open={withdraw} onClose={toggleWithdraw} />
    </div>
  )
}

const PublishedInventory = () => {
  const { quote, base, publishedBase, publishedQuote } = useParameters()

  const [unPublish, toggleUnpublish] = React.useReducer(
    (isOpen) => !isOpen,
    false,
  )
  const [close, toggleClose] = React.useReducer((isOpen) => !isOpen, false)

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between">
        <div className="flex items-center">
          <Title>Published inventory</Title>
          <InfoTooltip side="right">
            Liquidity in active offers.{" "}
            <Link
              href="https://docs.mangrove.exchange/general/kandel/how-does-kandel-work/strategy-reserve"
              target="_blank"
              rel="noreferrer"
              className="text-green-caribbean underline"
            >
              Learn more
            </Link>
          </InfoTooltip>
        </div>
        <div className="flex gap-2">
          {/* TODO: create dialog for add inventory */}
          {/* <Button onClick={toggleClose}>Add</Button> */}
          {/* <Button onClick={toggleUnpublish} variant={"secondary"}>
            Unpublish
          </Button> */}
        </div>
      </div>

      {/* Table */}
      <table className="w-full flex flex-col gap-2 mt-5 divide-y border-b pb-4">
        <thead>
          <tr className="flex justify-between">
            <Caption className="text-muted-foreground">Asset</Caption>
            <Caption className="text-muted-foreground">Amount</Caption>
          </tr>
        </thead>
        <tbody className="w-full flex flex-col gap-4 divide-y">
          <tr className="flex justify-between pt-4">
            <Text>{base?.symbol}</Text>
            <Text>
              {publishedBase &&
                Big(Number(publishedBase)).toFixed(
                  base?.displayedDecimals,
                  1,
                )}{" "}
              {base?.symbol}
            </Text>
          </tr>
          <tr className="flex justify-between pt-4">
            <Text>{quote?.symbol}</Text>
            <Text>
              {publishedQuote &&
                Big(Number(publishedQuote)).toFixed(
                  quote?.displayedAsPriceDecimals,
                  1,
                )}{" "}
              {quote?.symbol}
            </Text>
          </tr>
        </tbody>
      </table>

      {/* Dialogs */}
      {/* <CloseStrategyDialog isOpen={close} onClose={toggleClose} /> */}
      {/* <UnPublish open={unPublish} onClose={toggleUnpublish} /> */}
    </div>
  )
}

const BountyInventory = () => {
  const [bounty, toggleBounty] = React.useReducer((isOpen) => !isOpen, false)
  const { currentParameter } = useParameters()
  const { chain } = useAccount()

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between">
        <div className="flex items-center">
          <Title>Bounty</Title>
          <InfoTooltip side="right">
            <Caption>
              Amount of native tokens deposited into the strategy to cover
            </Caption>
            <Caption>in case your offer fails to deliver. </Caption>
            <Link
              href="https://docs.mangrove.exchange/general/kandel/how-does-kandel-work/parameters"
              target="_blank"
              rel="noreferrer"
              className="text-green-caribbean underline text-xs"
            >
              Learn more
            </Link>
          </InfoTooltip>
        </div>
        <div className="flex gap-2">
          {/* <Button onClick={toggleBounty}>Add</Button> */}
        </div>
      </div>

      {/* Table */}
      <table className="w-full flex flex-col gap-2 mt-5 divide-y border-b pb-4">
        <thead>
          <tr className="flex justify-between">
            <Caption as={"td"} className="text-muted-foreground">
              Asset
            </Caption>
            <Caption as={"td"} className="text-muted-foreground">
              Amount
            </Caption>
          </tr>
        </thead>
        <tbody className="w-full flex flex-col gap-4">
          <tr className="flex justify-between pt-4">
            <Text as="td">{chain?.nativeCurrency.symbol}</Text>
            <Text as="td">
              {Big(currentParameter.lockedBounty ?? 0).toString()}{" "}
              {chain?.nativeCurrency.symbol}
            </Text>
          </tr>
        </tbody>
      </table>

      {/* Dialogs */}
      <Bounty open={bounty} onClose={toggleBounty} />
    </div>
  )
}

export default function Parameters() {
  return (
    <div className="space-y-4">
      {/* Price range */}
      <PriceRangeInfos />

      {/* Info */}
      <InfoBar />

      {/* Tables */}
      <div className="flex flex-col gap-10 pb-5 pt-10 ">
        {/* <PublishedInventory /> */}
        <BountyInventory />
        <Inventory />
      </div>
    </div>
  )
}
