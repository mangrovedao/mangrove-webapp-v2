import type { Token } from "@mangrovedao/mangrove.js"

import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { TooltipContent } from "@radix-ui/react-tooltip"
import Link from "next/link"
import InfoTooltip from "./info-tooltip"

export function MinimumVolume(props: {
  token?: Token | string
  volume?: string
  label?: string
  action?: {
    onClick: (value: string) => void
    text?: string
  }
}) {
  const token = typeof props.token === "string" ? undefined : props.token

  return (
    <div className="flex justify-between items-center mt-1">
      <div className="flex items-center">
        <span className=" text-xs text-secondary float-left">
          {props.label ?? "Min. Volume"}
        </span>
        <InfoTooltip>
          <p className="text-xs">
            There is a minimum amount required for limit orders on Mangrove.{" "}
            <Link
              href="https://docs.mangrove.exchange/general/web-app/trade/how-to-make-an-order/limit-order"
              target="_blank"
              rel="noreferrer"
              className="text-green-caribbean"
            >
              Learn more
            </Link>
          </p>
        </InfoTooltip>
      </div>
      {!props.volume || !props.token ? (
        <Skeleton className="w-24 h-4" />
      ) : (
        <span className="text-xs space-x-1">
          <TooltipProvider>
            <Tooltip delayDuration={200}>
              <TooltipTrigger
                className="hover:opacity-80 transition-opacity ml-1"
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  props.action?.onClick(props.volume || "0")
                }}
              >
                <span>
                  {Number(props.volume).toFixed(token?.displayedDecimals)}{" "}
                  {token?.symbol}
                </span>
              </TooltipTrigger>
              <TooltipContent className="z-50" side="bottom">
                {Number(props.volume).toFixed(token?.decimals)} {token?.symbol}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {props?.action && props?.action.text && (
            <button
              className="text-xs underline"
              onClick={(e) => {
                props.volume && props?.action?.onClick(props.volume)
              }}
            >
              {props?.action.text}
            </button>
          )}
        </span>
      )}
    </div>
  )
}
