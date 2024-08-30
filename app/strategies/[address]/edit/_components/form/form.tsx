"use client"

import MarketSelector from "@/app/strategies/(shared)/_components/market-selector/market-selector"
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
import { formatUnits } from "viem"
import { Fieldset } from "../fieldset"
import { MinimumRecommended } from "./components/minimum-recommended"
import { MustBeAtLeastInfo } from "./components/must-be-at-least-info"
import useForm, { MIN_NUMBER_OF_OFFERS, MIN_STEP_SIZE } from "./use-form"

export function Form({ className }: { className?: string }) {
  const {
    baseToken,
    quoteToken,
    minBaseAmount,
    minQuoteAmount,
    minProvision,
    currentLiquiditySourcing,
    baseDeposit,
    quoteDeposit,
    totalQuoteBalance,
    totalBaseBalance,
    fieldsDisabled,
    errors,
    handleBaseDepositChange,
    handleQuoteDepositChange,
    isChangingFrom,
    numberOfOffers,
    logics,
    nativeBalance,
    stepSize,
    bountyDeposit,
    handleNumberOfOffersChange,
    handleStepSizeChange,
    handleBountyDepositChange,
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
      <Fieldset legend="Select market">
        <MarketSelector disabled={true} />
      </Fieldset>

      <Fieldset legend="Liquidity sourcing">
        <div className="flex justify-between space-x-2 pt-2">
          <div className="flex flex-col w-full">
            <Label className="flex items-center">
              Source
              <InfoTooltip>
                <Caption>Select the origin of the assets</Caption>
              </InfoTooltip>
            </Label>

            <Select
              name={"SendFrom"}
              value={currentLiquiditySourcing}
              onValueChange={(value: string) => {
                handleSendFromChange(value)
              }}
              disabled={true} //note: we don't allow modifying liquidity sourcing
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem
                    key={currentLiquiditySourcing}
                    value={currentLiquiditySourcing}
                  >
                    <div className="flex gap-2 w-full items-center">
                      <SourceIcon sourceId={currentLiquiditySourcing} />
                      <Caption className="capitalize">
                        {currentLiquiditySourcing}
                      </Caption>
                    </div>
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Fieldset>

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
            value={Number(minBaseAmount || 0)?.toFixed(baseToken.decimals)}
            action={{
              onClick: () =>
                minBaseAmount &&
                handleBaseDepositChange(minBaseAmount.toString()),
              text: "Update",
            }}
            loading={fieldsDisabled}
          />

          <CustomBalance
            label="Wallet balance"
            token={baseToken}
            balance={formatUnits(totalBaseBalance || 0n, baseToken.decimals)}
            tooltip="This is your current wallet balance plus your deposited liquidity"
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
            value={Number(minQuoteAmount || 0)?.toFixed(quoteToken.decimals)}
            action={{
              onClick: () =>
                minQuoteAmount &&
                handleQuoteDepositChange(minQuoteAmount.toString()),
              text: "Update",
            }}
            loading={fieldsDisabled}
          />

          <CustomBalance
            label="Wallet balance"
            token={quoteToken}
            balance={formatUnits(totalQuoteBalance || 0n, quoteToken.decimals)}
            tooltip="This is your current wallet balance plus your deposited liquidity"
            action={{
              onClick: handleQuoteDepositChange,
              text: "MAX",
            }}
          />
        </div>
      </Fieldset>

      <Fieldset legend="Settings">
        <div>
          <EnhancedNumericInput
            label="Number of offers"
            value={numberOfOffers}
            onChange={handleNumberOfOffersChange}
            disabled={fieldsDisabled}
            error={errors.pricePoints}
          />
          <MustBeAtLeastInfo
            min={MIN_NUMBER_OF_OFFERS}
            onMinClicked={handleNumberOfOffersChange}
          />
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
            value={minProvision?.toString()}
            action={{
              onClick: handleBountyDepositChange,
              text: "Update",
            }}
            loading={fieldsDisabled}
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
