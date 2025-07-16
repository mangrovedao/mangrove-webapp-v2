import { TokenIcon } from "@/components/token-icon"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { useTokenBalance } from "@/hooks/use-token-balance"
import { cn } from "@/utils"
import { Token } from "@mangrovedao/mgv"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronDown, Wallet } from "lucide-react"
import { useMemo } from "react"

type TokenContainerProps = {
  token?: Token
  type: "pay" | "receive"
  value: string
  dollarValue: number
  onTokenClicked?: () => void
  onMaxClicked?: () => void
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  isWrapping?: boolean
  seiBalance?: string
  fetchingQuote: "pay" | "receive" | null
  isLoading?: boolean
  conversionPercentage?: number
  disabled?: boolean
}

export function SwapInput({
  token,
  type,
  onTokenClicked,
  onMaxClicked,
  value,
  onChange,
  dollarValue,
  fetchingQuote,
  isLoading,
  conversionPercentage,
  disabled = false,
}: TokenContainerProps) {
  const { formattedAndFixed, isLoading: loadingBalance } =
    useTokenBalance(token)
  const isPay = type === "pay"
  const isFetching = fetchingQuote === type || isLoading

  const conversion = useMemo(() => {
    if (!conversionPercentage) return
    return conversionPercentage - 1
  }, [conversionPercentage])

  return (
    <div
      className={cn(
        "flex bg-primary-solid-black py-4 flex-col border border-transparent transition-all",
      )}
    >
      <div className="flex justify-between items-center w-full">
        <label className=" capitalize text-lg text-white opacity-40">
          {type}
        </label>
      </div>
      <div className="flex space-x-2">
        <div className="flex-1 relative h-10">
          <AnimatePresence mode="wait">
            {isFetching ? (
              <Skeleton className="w-[50%] h-[65%]" />
            ) : (
              <motion.div
                key={`actual-input-${token}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Input
                  aria-label="You pay"
                  className="border-none outline-none p-0 text-2xl h-full !text-white opacity-80"
                  placeholder="0"
                  value={value}
                  disabled={isFetching || disabled}
                  onChange={onChange}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <span>
          {token ? (
            <Button
              onClick={onTokenClicked}
              className="hover:bg-bg-subtle-hover hover:!text-white !text-white !bg-transparent p-0 rounded-sm text-sm flex items-center space-x-2"
            >
              <TokenIcon
                symbol={token.symbol}
                customSrc={`/custom-token-icons/${token.symbol.toLowerCase()}.webp`}
                imgClasses="rounded-sm"
                useFallback={true}
              />
              <span className="mt-1 text-xl text-nowrap text-white opacity-80">
                {token.symbol}
              </span>
              <ChevronDown className="mx-1 size-4 text-white opacity-70" />
            </Button>
          ) : (
            <Button className="text-nowrap ">
              <Spinner className="w-4 h-4" />
            </Button>
          )}
        </span>
      </div>
      <div className="text-sm flex items-center justify-between text-white">
        <AnimatePresence mode="wait">
          {isFetching ? (
            <Skeleton className="w-[100px] h-[20px]" />
          ) : (
            <motion.span
              key={`dollar-price-${token?.symbol}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              $
              {token && dollarValue !== 0 && !isNaN(dollarValue)
                ? dollarValue.toFixed(2)
                : "0.00"}
              {conversion && (
                <span
                  className={`${conversion > 0 ? "text-green-caribbean" : "text-red-100"} ml-1`}
                >
                  {conversion > 0 ? "+" : ""}({conversion.toFixed(2)}%)
                </span>
              )}
            </motion.span>
          )}
        </AnimatePresence>
        {token && !loadingBalance && !formattedAndFixed ? (
          <></>
        ) : token && !loadingBalance && formattedAndFixed ? (
          <div className="text-sm flex items-center space-x-1">
            <Wallet className="mb-1" size={14} />
            <span className="text-white opacity-60">{formattedAndFixed}</span>
            {isPay && (
              <Button
                onClick={onMaxClicked}
                variant={"invisible"}
                className="text-green-caribbean p-0"
                disabled={value === formattedAndFixed || disabled}
              >
                Max
              </Button>
            )}
          </div>
        ) : loadingBalance ? (
          <Skeleton className="w-10 h-3" />
        ) : undefined}
      </div>
    </div>
  )
}
