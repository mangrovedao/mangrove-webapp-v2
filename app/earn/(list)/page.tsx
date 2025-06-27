"use client"

import { TokenIcon } from "@/components/token-icon-new"
import { Text } from "@/components/typography/text"
import { Title } from "@/components/typography/title"
import { useEffect, useState } from "react"
import { useVaultWhiteList } from "../(shared)/_hooks/use-vault-whitelist"
import { Tables } from "./_components/tables/tables"

export default function Page() {
  const { data: vaults } = useVaultWhiteList()
  const [tokens, setTokens] = useState<string[]>([])

  // Extract unique tokens from vaults' markets
  useEffect(() => {
    if (!vaults?.length) return

    const uniqueTokens = vaults.reduce<string[]>((acc, vault) => {
      const baseSymbol = vault.market.base.symbol
      const quoteSymbol = vault.market.quote.symbol

      if (!acc.includes(baseSymbol)) acc.push(baseSymbol)
      if (!acc.includes(quoteSymbol)) acc.push(quoteSymbol)

      return acc
    }, [])

    setTokens(uniqueTokens)
  }, [vaults])

  // Duplicate tokens array to ensure continuous flow
  const displayTokens = [...tokens, ...tokens, ...tokens, ...tokens]

  return (
    <main className="flex flex-col min-h-[calc(100vh-80px)] max-w-7xl mx-auto">
      {/* Header */}
      <div className="mt-5 flex justify-between items-center">
        <Title variant={"header1"}>Earn</Title>
      </div>

      {/* Main content */}
      <div className="flex-1">
        <Tables />
      </div>

      {/* Footer with animated coin display - always at bottom */}
      <div className="w-full h-[160px] relative mb-24">
        {/* Background coins animation */}
        <div className="absolute inset-0 w-full overflow-hidden opacity-50 flex items-center">
          {/* Single continuous animation row */}
          <div className="token-scroll-container absolute w-max">
            {displayTokens.map((token, i) => (
              <div
                key={`${token}-${i}`}
                className="inline-block mx-4"
                title={`Earn with ${token}`}
              >
                <TokenIcon
                  symbol={token}
                  imgClasses="w-12 h-12 sm:w-16 sm:h-16 drop-shadow-glow rounded-full"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Text content - positioned on top of the coins */}
        <div className="w-full h-full relative z-10 flex items-center justify-center rounded-sm bg-gradient-to-r from-bg-secondary/80 via-bg-primary/80 to-bg-secondary/80 backdrop-blur-sm">
          <div className="text-center">
            <Title
              variant="header1"
              className="text-text-primary mb-2 text-2xl"
            >
              Earn Passive Income
            </Title>
            <Text className="text-text-secondary max-w-2xl mx-auto px-4">
              Deposit into our vaults to earn trading fees and incentives while
              maintaining liquidity.
            </Text>
          </div>
        </div>
      </div>

      <style jsx global>{`
        table tbody * {
          @apply font-ubuntu !text-lg font-normal text-white;
        }
        table tbody tr:first-child td:first-child > div > div {
          max-width: 24px;
        }

        /* Continuous scrolling animation - no breaks */
        .token-scroll-container {
          animation: scrollLeft 60s linear infinite;
          will-change: transform;
        }

        @keyframes scrollLeft {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .drop-shadow-glow {
          filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.4));
        }
      `}</style>
    </main>
  )
}
