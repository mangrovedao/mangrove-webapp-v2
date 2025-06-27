import { useKandelApr } from "@/app/earn/(shared)/_hooks/use-kandel.apr"
import { Vault } from "@/app/earn/(shared)/_hooks/use-vault-whitelist"
import { AnimatedSkeleton } from "@/app/earn/(shared)/components/animated-skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useDefaultChain } from "@/hooks/use-default-chain"
import { useMemo } from "react"
import { Address, isAddressEqual } from "viem"
import { Value } from "../../(list)/_components/tables/vaults/components/value"
import { useLeaderboards } from "../_hooks/use-kandel-rewards"
import { useVaultsInfos } from "../_hooks/use-vault.info"

interface AprProps {
  isLoading: boolean
  isDeprecated: boolean
  kandelAddress?: Address
  vault: Vault
}

export function Apr({
  isLoading,
  isDeprecated,
  kandelAddress,
  vault,
}: AprProps) {
  if (isLoading || !kandelAddress) {
    return (
      <div className="text-right w-full">
        <AnimatedSkeleton className="h-6 w-24 ml-auto" />
      </div>
    )
  }

  const { defaultChain } = useDefaultChain()
  const { data: vaultsInfos } = useVaultsInfos([kandelAddress])

  if (isDeprecated) {
    return <div className="text-right w-full flex-end">-</div>
  }

  const { data: kandelApr } = useKandelApr(
    vaultsInfos?.[0]?.kandel,
    defaultChain.id,
  )

  const incentivesApy = vault.incentives?.[0]?.apy ?? 0
  const apr = kandelApr ? `${kandelApr.apr.mangroveKandelAPR.toFixed(2)}%` : "-"
  const incentivesApr = incentivesApy ? `${incentivesApy.toFixed(2)}%` : "-"
  const { data: leaderboard } = useLeaderboards()

  const currentIncentives = useMemo(() => {
    const date = new Date()
    return vault.incentives.filter((i) => {
      const inRange =
        i.startTimestamp < date.getTime() / 1000 &&
        i.endTimestamp > date.getTime() / 1000
      const done = !!leaderboard.find(
        (l) =>
          isAddressEqual(l.vault as Address, vault.address) &&
          l.incentiveId === i.id,
      )?.isOver
      return inRange && !done
    })
  }, [vault.incentives, vault.address, leaderboard])

  const totalApr = useMemo(() => {
    return (
      (kandelApr?.apr.mangroveKandelAPR ?? 0) +
      (kandelApr?.apr.aaveAPR ?? 0) +
      currentIncentives.reduce((acc, i) => acc + i.apy, 0)
    )
  }, [kandelApr, currentIncentives])

  return (
    <div className="group relative w-full text-right">
      <TooltipProvider>
        <Tooltip delayDuration={200}>
          <TooltipTrigger className="hover:opacity-80 transition-opacity">
            <Value value={totalApr} className="justify-end" />
          </TooltipTrigger>
          <TooltipContent
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            className="p-4 bg-bg-secondary border border-border-primary"
          >
            <div className="cursor-default">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-text-secondary">
                    Native APR
                  </span>
                  <span className="text-sm text-text-primary">{apr}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-text-secondary">
                    Incentive APR
                  </span>
                  <span className="text-sm text-text-primary">
                    {incentivesApr}
                  </span>
                </div>
              </div>
              <hr className="my-2" />
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-text-secondary">Net APR</span>
                <span className="text-sm text-text-primary">{totalApr}</span>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
