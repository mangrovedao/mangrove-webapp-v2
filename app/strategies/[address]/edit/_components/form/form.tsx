"use client"

import MarketSelector from "@/app/strategies/(shared)/_components/market-selector/market-selector"
import { TokenBalance } from "@/components/stateful/token-balance/token-balance"
import { EnhancedNumericInput } from "@/components/token-input"
import { Skeleton } from "@/components/ui/skeleton"
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
    sendFrom,
    receiveTo,
    handleBaseDepositChange,
    handleQuoteDepositChange,
    kandelRequirementsQuery,
    isChangingFrom,
    numberOfOffers,
    handleNumberOfOffersChange,
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
      {/* <Fieldset legend="Liquidity sourcing">
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
      </Fieldset> */}

      <Fieldset legend="Select market">
        <MarketSelector disabled={true} />
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
            value={Number(minQuoteAmount || 0)?.toFixed(quoteToken.decimals)}
            action={{
              onClick: () =>
                minQuoteAmount &&
                handleQuoteDepositChange(minQuoteAmount.toString()),
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
            value={minProvision.toString()}
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
