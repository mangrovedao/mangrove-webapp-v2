"use client"

import React from "react"

import { cn } from "@/utils"

import { useDefaultChain } from "@/hooks/use-default-chain"
import { redirect } from "next/navigation"
import {
  LeaderboardEntry,
  useLeaderboard,
} from "./_components/tables/leaderboard/hooks/use-leaderboard"

export default function Page() {
  const [tab, setTab] = React.useState("leaderboard")
  const {
    data: leaderboard,
    isLoading,
    isFetching,
  } = useLeaderboard({
    select: (data) => data,
  })
  const { defaultChain } = useDefaultChain()

  // Calculate total rewards across all users
  const totalStats = leaderboard?.reduce(
    (
      acc: {
        totalVolumeRewards: number
        totalVaultRewards: number
        totalRewards: number
      },
      entry: LeaderboardEntry,
    ) => {
      return {
        totalVolumeRewards: acc.totalVolumeRewards + entry.volumeRewards,
        totalVaultRewards: acc.totalVaultRewards + entry.vaultRewards,
        totalRewards: acc.totalRewards + entry.totalRewards,
      }
    },
    { totalVolumeRewards: 0, totalVaultRewards: 0, totalRewards: 0 },
  )

  return redirect("/trade")
}

function Label({ children }: React.ComponentProps<"span">) {
  return <span className="text-sm text-text-secondary">{children}</span>
}

function Value({
  children,
  size = "normal",
}: React.ComponentProps<"span"> & { size?: "small" | "normal" }) {
  return (
    <span
      className={cn({
        "text-2xl": size === "normal",
        "text-sm": size === "small",
      })}
    >
      {children} <span className="text-text-secondary">MGV</span>
    </span>
  )
}

/* 

box-sizing: border-box;

display: flex;
flex-direction: column;
justify-content: center;
align-items: flex-start;
padding: 20px;
gap: 20px;
isolation: isolate;

width: 376px;
height: 179px;

background: #0B1719;
box-shadow: 0px 0px 24px rgba(0, 203, 111, 0.4);
border-radius: 16px;

Inside auto layout
flex: none;
order: 0;
align-self: stretch;
flex-grow: 0;
 */
