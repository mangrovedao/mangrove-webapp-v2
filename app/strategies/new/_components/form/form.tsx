"use client"

import MarketSelector from "@/app/strategies/(shared)/_components/market-selector/market-selector"
import SourceIcon from "@/app/trade/_components/forms/limit/components/source-icon"
import InfoTooltip from "@/components/info-tooltip"
import { CustomBalance } from "@/components/stateful/token-balance/custom-balance"
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
import { useTokenBalance } from "@/hooks/use-token-balance"
import { cn } from "@/utils"
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
    baseDeposit,
    quoteDeposit,
    fieldsDisabled,
    errors,
    isValid,
    isChangingFrom,
    numberOfOffers,
    stepSize,
    nativeBalance,
    logics,
    bountyDeposit,
    sendFrom,
    receiveTo,
    handleReceiveToChange,
    handleSendFromChange,
    handleBaseDepositChange,
    handleQuoteDepositChange,
    handleNumberOfOffersChange,
    handleStepSizeChange,
    handleBountyDepositChange,
  } = useForm()

  const { formatted: baseTokenBalance } = useTokenBalance(baseToken)
  const { formatted: quoteTokenBalance } = useTokenBalance(quoteToken)

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
        <MarketSelector />
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
              value={sendFrom}
              onValueChange={(value: string) => {
                handleSendFromChange(value)
              }}
              disabled={fieldsDisabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem key={"simple"} value={"simple"}>
                    <div className="flex gap-2 w-full items-center">
                      <SourceIcon sourceId={"simple"} />
                      <Caption className="capitalize">{"Wallet"}</Caption>
                    </div>
                  </SelectItem>
                  {logics?.map(
                    (logic) =>
                      logic && (
                        <SelectItem key={logic.name} value={logic.name}>
                          <div className="flex gap-2 w-full items-center">
                            <SourceIcon sourceId={logic.name} />
                            <Caption className="capitalize">
                              {logic.name}
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

      <Fieldset className="space-y-4" legend="Set initial inventory">
        <div>
          <EnhancedNumericInput
            token={baseToken}
            label={`${baseToken?.symbol} amount`}
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
            balance={baseTokenBalance}
            action={{
              onClick: handleBaseDepositChange,
              text: "MAX",
            }}
          />
        </div>
        <div>
          <EnhancedNumericInput
            token={quoteToken}
            label={`${quoteToken?.symbol} amount`}
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
            balance={quoteTokenBalance}
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
            label={`${nativeBalance?.symbol} amount`}
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
