"use client"

import SourceIcon from "@/app/trade/_components/forms/limit/components/source-icon"
import InfoTooltip from "@/components/info-tooltip"
import { TokenBalance } from "@/components/stateful/token-balance/token-balance"
import { EnhancedNumericInput } from "@/components/token-input"
import { Caption } from "@/components/typography/caption"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/utils"
import { Fieldset } from "../fieldset"
import { MinimumRecommended } from "./components/minimum-recommended"
import { MustBeAtLeastInfo } from "./components/must-be-at-least-info"
import useForm, { MIN_PRICE_POINTS, MIN_RATIO, MIN_STEP_SIZE } from "./use-form"

export function Form({ className }: { className?: string }) {
  const {
    baseToken,
    quoteToken,
    requiredBase,
    requiredQuote,
    requiredBounty,
    baseDeposit,
    quoteDeposit,
    fieldsDisabled,
    errors,
    sendFrom,
    receiveTo,
    handleBaseDepositChange,
    handleQuoteDepositChange,
    kandelRequirementsQuery,
    isChangingFrom,
    pricePoints,
    handlePricePointsChange,
    ratio,
    handleRatioChange,
    stepSize,
    handleStepSizeChange,
    nativeBalance,
    bountyDeposit,
    handleBountyDepositChange,
    handleSendFromChange,
    handleReceiveToChange,
    logics,
  } = useForm()

  if (!baseToken || !quoteToken)
    return (
      <div className={"p-0.5"}>
        <Skeleton className="w-full h-screen" />
      </div>
    )

  return (
    <form
      className={cn("space-y-6", className)}
      onSubmit={(e) => {
        e.preventDefault()
      }}
    >
      <Fieldset className="space-y-4" legend="Edit inventory">
        <div>
          <EnhancedNumericInput
            token={baseToken}
            label={`${baseToken?.symbol} deposit`}
            value={baseDeposit}
            onChange={handleBaseDepositChange}
            disabled={fieldsDisabled}
            error={errors.baseDeposit}
          />
          <MinimumRecommended
            token={baseToken}
            value={requiredBase?.toFixed(baseToken.decimals)}
            action={{
              onClick: () =>
                requiredBase &&
                handleBaseDepositChange(requiredBase.toString()),
              text: "Update",
            }}
            loading={
              kandelRequirementsQuery.status !== "success" || fieldsDisabled
            }
          />
          <TokenBalance
            label="Wallet balance"
            token={baseToken}
            action={{
              onClick: handleBaseDepositChange,
              text: "MAX",
            }}
          />
        </div>
        <div>
          <EnhancedNumericInput
            token={quoteToken}
            label={`${quoteToken?.symbol} deposit`}
            value={quoteDeposit}
            onChange={handleQuoteDepositChange}
            disabled={fieldsDisabled}
            error={errors.quoteDeposit}
          />

          <MinimumRecommended
            token={quoteToken}
            value={requiredQuote?.toFixed(quoteToken.decimals)}
            action={{
              onClick: () =>
                requiredQuote &&
                handleQuoteDepositChange(requiredQuote.toString()),
              text: "Update",
            }}
            loading={
              kandelRequirementsQuery.status !== "success" || fieldsDisabled
            }
          />
          <TokenBalance
            label="Wallet balance"
            token={quoteToken}
            action={{
              onClick: handleQuoteDepositChange,
              text: "MAX",
            }}
          />
        </div>
      </Fieldset>

      <Fieldset legend="Liquidity sourcing">
        <div className="flex justify-between space-x-2 pt-2">
          <div className="flex flex-col w-full">
            <Label className="flex items-center">
              Send from
              <InfoTooltip>
                <Caption>Select the origin of the assets</Caption>
              </InfoTooltip>
            </Label>

            <Select
              name={"SendFrom"}
              value={sendFrom}
              onValueChange={(value: string) => {
                handleSendFromChange(value)
              }}
              // disabled={!market}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {logics?.map(
                    (logic) =>
                      logic && (
                        <SelectItem key={logic.id} value={logic.id}>
                          <div className="flex gap-2 w-full items-center">
                            <SourceIcon sourceId={logic.id} />
                            <Caption className="capitalize">
                              {logic.id.toUpperCase()}
                            </Caption>
                          </div>
                        </SelectItem>
                      ),
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col w-full z-50">
            <Label className="flex items-center">
              Receive to
              <InfoTooltip className="ml-2" side="left">
                <div>
                  <Caption>Select the destination of the assets</Caption>

                  <Caption>(after the trade is executed)</Caption>
                </div>
              </InfoTooltip>
            </Label>

            <Select
              name={"receiveTo"}
              value={receiveTo}
              onValueChange={(value: string) => {
                handleReceiveToChange(value)
              }}
              // disabled={!market}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {logics?.map(
                    (logic) =>
                      logic && (
                        <SelectItem key={logic.id} value={logic.id}>
                          <div className="flex gap-2 w-full items-center">
                            <SourceIcon sourceId={logic.id} />
                            <Caption className="capitalize">
                              {logic.id.toUpperCase()}
                            </Caption>
                          </div>
                        </SelectItem>
                      ),
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Fieldset>

      <Fieldset legend="Settings">
        <div>
          <EnhancedNumericInput
            label="Number of price points"
            value={pricePoints}
            onChange={handlePricePointsChange}
            disabled={fieldsDisabled}
            error={errors.pricePoints}
          />
          <MustBeAtLeastInfo
            min={MIN_PRICE_POINTS}
            onMinClicked={handlePricePointsChange}
          />
        </div>

        <div>
          <EnhancedNumericInput
            label="Ratio"
            value={ratio}
            onChange={handleRatioChange}
            disabled={fieldsDisabled}
            error={isChangingFrom === "ratio" ? errors.ratio : undefined}
          />
          <MustBeAtLeastInfo min={MIN_RATIO} onMinClicked={handleRatioChange} />
        </div>
        <div>
          <EnhancedNumericInput
            label="Step size"
            value={stepSize}
            onChange={handleStepSizeChange}
            disabled={fieldsDisabled}
            error={isChangingFrom === "stepSize" ? errors.stepSize : undefined}
          />
          <MustBeAtLeastInfo
            min={MIN_STEP_SIZE}
            onMinClicked={handleStepSizeChange}
          />
        </div>
      </Fieldset>

      <Fieldset legend="Bounty">
        <div>
          <EnhancedNumericInput
            label={`${nativeBalance?.symbol} deposit`}
            token={nativeBalance?.symbol}
            value={bountyDeposit}
            onChange={handleBountyDepositChange}
            disabled={fieldsDisabled}
            error={errors.bountyDeposit}
          />
          <MinimumRecommended
            token={nativeBalance?.symbol}
            value={requiredBounty}
            action={{
              onClick: handleBountyDepositChange,
              text: "Update",
            }}
            loading={
              kandelRequirementsQuery.status !== "success" || fieldsDisabled
            }
          />

          <TokenBalance
            label="Wallet balance"
            token={nativeBalance?.symbol}
            action={{
              onClick: handleBountyDepositChange,
              text: "MAX",
            }}
          />
        </div>
      </Fieldset>
    </form>
  )
}
