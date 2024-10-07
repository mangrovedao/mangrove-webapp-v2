import { X } from "lucide-react"
import Link from "next/link"
import React from "react"

import { Title } from "@/components/typography/title"
import { Button } from "@/components/ui/button-old"
import { Info } from "@/svgs"
import { cn } from "@/utils"
import useKandel from "../../_providers/kandel-strategy"

export default function InformationBanner() {
  const [bannerOpen, setBannerOpen] = React.useState(true)
  const { strategyStatusQuery, mergedOffers } = useKandel()
  const { isOutOfRange } = strategyStatusQuery.data ?? {}

  const allOffersAreDead = !mergedOffers || mergedOffers?.length === 0

  const isInactive = strategyStatusQuery.data?.status === "inactive"
  const isClosed = strategyStatusQuery.data?.status === "closed"
  const isActive = strategyStatusQuery.data?.status === "active"

  if (
    !strategyStatusQuery.data ||
    strategyStatusQuery.isLoading ||
    !bannerOpen ||
    isActive // FIXME: check if we keep the information when offers are empty
  )
    return null

  return (
    <aside
      className={cn("border rounded-lg px-4 pt-4 pb-6 my-6 relative", {
        "border-cherry-400": isInactive || isClosed,
        "border-mango-200": isActive,
      })}
    >
      <button
        className="absolute top-4 right-4 hover:opacity-90 transition-opacity"
        onClick={() => setBannerOpen(false)}
      >
        <X className="text-cloud-300 w-5 h-5" />
        <span className="sr-only">Close</span>
      </button>

      <div className="inline-flex space-x-2">
        <div
          className={cn(
            "h-8 aspect-square rounded-lg flex items-center justify-center text-red-100 p-1",
            {
              "bg-cherry-400": isInactive || isClosed,
              "bg-mango-300": isActive,
            },
          )}
        >
          <Info
            className={
              isInactive || isClosed
                ? "text-cherry-100 rotate-180"
                : "text-mango-100"
            }
          />
        </div>

        <div>
          <Title>
            {isInactive || isClosed
              ? "Strategy is inactive"
              : "Strategy has empty offer"}
          </Title>
          <ul
            className={cn("list-none text-sm font-normal mt-4 text-cloud-300", {
              "mb-6": isInactive || isClosed,
            })}
          >
            {isOutOfRange && (
              <li>
                <span className="text-white mr-2">Out of range:</span> Update
                the price range to re-activate this strategy.
              </li>
            )}
            {allOffersAreDead && (
              <li>
                <span className="text-white mr-2">All offers are empty:</span>{" "}
                Update the price range and publish inventory to re-activate this
                strategy.
              </li>
            )}
            {isActive && (
              <li>
                We’ve notice empty offer in this strategy.
                {/* You can refill it
                bellow. */}
              </li>
            )}
          </ul>

          <div className="space-x-2 mt-2">
            <Button variant={"secondary"} size={"md"} className="px-5" asChild>
              <Link
                href={
                  "https://docs.mangrove.exchange/general/web-app/strategies/manage-strat/statuses-and-alerts"
                }
                target="_blank"
                rel="noreferrer"
              >
                Learn more
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </aside>
  )
}
