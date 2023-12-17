import { Accordion } from "@ark-ui/react"
import { Token } from "@mangrovedao/mangrove.js"
import { ValidationError } from "@tanstack/react-form"
import { LucideChevronRight } from "lucide-react"
import React from "react"

import {
  CustomRadioGroup,
  CustomRadioGroupItem,
} from "@/components/custom-radio-group"
import { NumericInput, NumericInputProps } from "@/components/numeric-input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/utils"
import { TokenBalance } from "../components/token-balance"
import { TradeAction } from "../enums"
import FromWalletLimitOrderDialog from "./components/from-wallet-order-dialog"
import { useMarketForm } from "./hooks/use-market"
import { Form } from "./types"
import { isGreaterThanZeroValidator, sendValidator } from "./validators"

const sliderValues = [25, 50, 75, 100]
const slippageValues = ["0.1", "0.5", "1"]

export function Market() {
  const [formData, setFormData] = React.useState<Form>()
  const [showCustomInput, setShowCustomInput] = React.useState(false)

  const {
    computeReceiveAmount,
    computeSendAmount,
    sendTokenBalance,
    handleSubmit,
    form,
    market,
    sendToken,
    receiveToken,
    marketInfo,
    estimatedVolume,
    estimatedFee,
  } = useMarketForm({ onSubmit: (formData) => setFormData(formData) })

  const handlePercentageButtonClick = (percentage: number) => {
    form.setFieldValue("sliderPercentage", percentage)
    computeSendAmount()
  }

  // const sliderPercentage = Math.min(
  //   Math.trunc(
  //     Big(Number(send))
  //       .mul(100)
  //       .div(sendTokenBalance.formatted ?? 0)
  //       .toNumber(),
  //   ),
  //   100,
  // )

  // const { validate, setValue, pushValue, validateSync } = form.useField({
  //   name: "send",
  // })

  // validateSync("", "submit")

  // console.log(JSON.stringify({ sliderPercentage }))

  return (
    <>
      <form.Provider>
        <form onSubmit={handleSubmit} autoComplete="off">
          <form.Field name="tradeAction">
            {(field) => (
              <CustomRadioGroup
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onValueChange={(e: TradeAction) => {
                  field.handleChange(e)
                  computeReceiveAmount()
                }}
                disabled={!market}
              >
                {Object.values(TradeAction).map((action) => (
                  <CustomRadioGroupItem
                    key={action}
                    value={action}
                    id={action}
                    variant={
                      action === TradeAction.SELL ? "secondary" : "primary"
                    }
                    className="capitalize"
                  >
                    {action}
                  </CustomRadioGroupItem>
                ))}
              </CustomRadioGroup>
            )}
          </form.Field>
          <div className="space-y-4 !mt-6">
            <form.Field
              name="send"
              onChange={sendValidator(Number(sendTokenBalance.formatted ?? 0))}
            >
              {(field) => (
                <TradeInput
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={({ target: { value } }) => {
                    field.handleChange(value)
                    computeReceiveAmount()
                  }}
                  token={sendToken}
                  label="Send amount"
                  disabled={!market}
                  showBalance
                  error={
                    estimatedVolume === "0"
                      ? ["error"]
                      : field.state.meta.touchedErrors
                  }
                />
              )}
            </form.Field>
            <form.Field name="receive" onChange={isGreaterThanZeroValidator}>
              {(field) => (
                <TradeInput
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={({ target: { value } }) => {
                    field.handleChange(value)
                    computeSendAmount()
                  }}
                  token={receiveToken}
                  label="Receive amount"
                  disabled={!(market && form.state.isFormValid)}
                  error={field.state.meta.touchedErrors}
                  showBalance
                />
              )}
            </form.Field>
            <form.Field name="sliderPercentage">
              {(field) => (
                <div className="space-y-5 pt-2 px-3">
                  <Slider
                    name={field.name}
                    defaultValue={[field.state.value]}
                    value={[field.state.value]}
                    step={25}
                    onBlur={field.handleBlur}
                    onChange={({ target: { value } }: any) => {
                      field.handleChange(value)
                    }}
                    disabled={!(market && form.state.isFormValid)}
                  />
                  <div className="flex justify-center space-x-3">
                    {sliderValues.map((value) => (
                      <Button
                        key={`percentage-button-${value}`}
                        variant={"secondary"}
                        size={"sm"}
                        className={cn("text-xs w-full", {
                          "opacity-10": field.state.value !== value,
                        })}
                        onClick={(e) => {
                          e.preventDefault()
                          handlePercentageButtonClick(value)
                        }}
                        disabled={!market}
                      >
                        {value}%
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </form.Field>

            {/* TODO: set slider and synchronize it to send field */}
            {/* <CSlider form={form} sliderPercentage={sliderPercentage} /> */}

            <Separator className="!my-6" />
            <div className="flex justify-between">
              <span className="text-muted-foreground text-xs">
                Average market price
              </span>
              <span className="text-xs">$0.00</span>
            </div>
            <Separator className="!my-6" />
            <form.Field name="slippagePercentage">
              {(field) => (
                <div className="space-y-2">
                  <Label>Slippage tolerence</Label>
                  {/* Add buttons for 25%, 50%, 75%, and 100% */}
                  <div className="flex space-x-3">
                    {slippageValues.map((value) => (
                      <Button
                        key={`percentage-button-${value}`}
                        variant={"secondary"}
                        size={"sm"}
                        className={cn("text-xs", {
                          "opacity-10":
                            field.state.value !== value || showCustomInput,
                        })}
                        onClick={(e) => {
                          e.preventDefault()
                          showCustomInput &&
                            setShowCustomInput(!showCustomInput)
                          field.handleChange(value)
                        }}
                        disabled={!market}
                      >
                        {value}%
                      </Button>
                    ))}
                    <Button
                      onClick={() => setShowCustomInput(!showCustomInput)}
                      variant={"secondary"}
                      size={"sm"}
                      className={cn("text-xs", {
                        "opacity-10": !showCustomInput,
                      })}
                    >
                      Custom
                    </Button>
                  </div>
                  {/* Render the custom input component */}
                  {showCustomInput && (
                    <TradeInput
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={({ target: { value } }) => {
                        field.handleChange(value)
                      }}
                      label="Custom"
                      disabled={!(market && form.state.isFormValid)}
                      error={field.state.meta.touchedErrors}
                    />
                  )}
                </div>
              )}
            </form.Field>
            <Separator className="!my-6" />

            {/* TODO: unmock market details */}
            <Accordion title="Market details" className="!mb-6">
              <MarketDetailsLine
                title="Estimated fee"
                value={estimatedFee || "N/A"}
              />
              <MarketDetailsLine title="Taker fee" value={"0"} />
              {/* TODO: <MarketDetailsLine title="Total fees" value="$0.26" /> */}
              <MarketDetailsLine
                title="Tick size"
                value={marketInfo?.tickSpacing.toString() ?? "-"}
              />
              {/* TODO: <MarketDetailsLine title="Current spot price" value="1234" />
            <MarketDetailsLine title="Min. order size" value="12" /> */}
            </Accordion>

            <form.Subscribe
              selector={(state) => [
                state.canSubmit,
                state.isSubmitting,
                state.values.tradeAction,
              ]}
            >
              {([canSubmit, isSubmitting, tradeAction]) => {
                return (
                  <Button
                    className="w-full flex items-center justify-center !mb-4 capitalize"
                    size={"lg"}
                    type="submit"
                    disabled={!canSubmit || !market}
                  >
                    {isSubmitting ? "Processing..." : tradeAction}
                    <div
                      className={cn(
                        "ml-2 bg-white h-6 w-6 rounded-full text-secondary flex items-center justify-center transition-opacity",
                        {
                          "opacity-10": !market,
                        },
                      )}
                    >
                      <LucideChevronRight className="h-4 text-current" />
                    </div>
                  </Button>
                )
              }}
            </form.Subscribe>
          </div>
        </form>
      </form.Provider>
      {formData && (
        <FromWalletLimitOrderDialog
          form={formData}
          onClose={() => setFormData(undefined)}
        />
      )}
    </>
  )
}

type MarketDetailsLineProps = {
  title: string
  value: string
}
function MarketDetailsLine({ title, value }: MarketDetailsLineProps) {
  return (
    <div className="flex justify-between items-center mt-2">
      <span className="text-xs text-secondary float-left">{title}</span>
      <span className="text-xs float-right">{value}</span>
    </div>
  )
}

// type CSliderProps = {
//   sliderPercentage: number
//   form: any
// }
// function CSlider({ sliderPercentage, form }: CSliderProps) {
//   const { handleChange, validateSync, setValue } = form.useField({
//     name: "send",
//   })
//   console.log(handleChange)
//   return (
//     <div className="space-y-5 pt-2">
//       <Slider
//         value={[sliderPercentage]}
//         step={5}
//         max={100}
//         onValueChange={([val]) => {
//           setValue(val?.toString(), {
//             notify: true,
//             touch: false,
//           })
//           validateSync(val?.toString(), "submit")
//           // handleChange(val?.toString())
//           // validate()
//         }}
//       />

//       <div className="flex space-x-3">
//         {sliderValues.map((value, i) => (
//           <Button
//             key={`slider-value-${i}`}
//             className="bg-transparent text-primary rounded-full text-xs pt-1 pb-[2px] w-16 border-[1px] border-green-bangladesh"
//             onClick={(e) => {
//               e.preventDefault()
//               // setSlider(value)
//             }}
//           >
//             {value}%
//           </Button>
//         ))}
//       </div>
//     </div>
//   )
// }

type TradeInputProps = {
  token?: Token
  disabled?: boolean
  label?: string
  showBalance?: boolean
  error?: ValidationError[]
} & NumericInputProps

const TradeInput = React.forwardRef<HTMLInputElement, TradeInputProps>(
  ({ label, token, showBalance = false, error, ...inputProps }, ref) => {
    return (
      <div className="flex-col flex">
        {label && <Label>{label}</Label>}
        <NumericInput
          {...inputProps}
          ref={ref}
          icon={token?.symbol}
          symbol={token?.symbol}
          aria-invalid={!!error?.length}
        />
        {error && (
          <p role="aria-live" className="text-red-100 text-xs leading-4 mt-1">
            {error}
          </p>
        )}
        {!error?.length && showBalance && <TokenBalance token={token} />}
      </div>
    )
  },
)

TradeInput.displayName = "TradeInput"
