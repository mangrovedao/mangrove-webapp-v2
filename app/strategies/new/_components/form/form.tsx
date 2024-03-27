"use client"

import { CustomBalance } from "@/components/stateful/token-balance/custom-balance"
import { TokenBalance } from "@/components/stateful/token-balance/token-balance"
import { EnhancedNumericInput } from "@/components/token-input"
import { Skeleton } from "@/components/ui/skeleton"
import { useTokenBalance } from "@/hooks/use-token-balance"
import { cn } from "@/utils"
import { Fieldset } from "../fieldset"
import { MinimumRecommended } from "./components/minimum-recommended"
import { MustBeAtLeastInfo } from "./components/must-be-at-least-info"
import useForm, { MIN_NUMBER_OF_OFFERS, MIN_STEP_SIZE } from "./use-form"

export function Form({ className }: { className?: string }) {
  const {
    address,
    baseToken,
    quoteToken,
    requiredBase,
    requiredQuote,
    requiredBounty,
    baseDeposit,
    quoteDeposit,
    fieldsDisabled,
    errors,
    kandelRequirementsQuery,
    isChangingFrom,
    numberOfOffers,
    stepSize,
    nativeBalance,
    bountyDeposit,
    sendFrom,
    receiveTo,
    mangroveLogics,
    handleBaseDepositChange,
    handleQuoteDepositChange,
    handleNumberOfOffersChange,
    handleStepSizeChange,
    handleBountyDepositChange,
    handleSendFromChange,
    handleReceiveToChange,
  } = useForm()

  // const { sendFromLogics, receiveToLogics, sendFromBalance, receiveToBalance } =
  //   useLiquiditySourcing({
  //     sendToken: baseToken,
  //     sendFrom,
  //     receiveTo,
  //     receiveToken: quoteToken,
  //     fundOwner: address,
  //     mangroveLogics,
  //   })

  const { formatted: baseTokenBalance } = useTokenBalance(baseToken)
  const { formatted: quoteTokenBalance } = useTokenBalance(quoteToken)

  // const baseBalance = sendFromBalance
  //   ? sendFromBalance.formatted
  //   : baseTokenBalance
  // const quoteBalance = receiveToBalance
  //   ? receiveToBalance.formatted
  //   : quoteTokenBalance

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
              disabled={
                kandelRequirementsQuery.status !== "success" || fieldsDisabled
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {sendFromLogics?.map(
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
              <InfoTooltip className="ml-2">
                <div>
                  <Caption>Select the destination of the assets</Caption>
                </div>
              </InfoTooltip>
            </Label>

            <Select
              name={"receiveTo"}
              value={receiveTo}
              onValueChange={(value: string) => {
                handleReceiveToChange(value)
              }}
              disabled={
                kandelRequirementsQuery.status !== "success" || fieldsDisabled
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {receiveToLogics?.map(
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

      <Fieldset className="space-y-4" legend="Set initial inventory">
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
