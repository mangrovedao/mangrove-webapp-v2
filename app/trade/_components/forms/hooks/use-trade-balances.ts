import { Token } from "@mangrovedao/mgv"
import { useQuery } from "@tanstack/react-query"
import { erc20Abi, formatUnits, type Address } from "viem"
import { useAccount, useBalance, usePublicClient } from "wagmi"

type UseTradeBalancesProps = {
  sendToken?: Token
  receiveToken?: Token
}

export function useTradeBalances({
  sendToken,
  receiveToken,
}: UseTradeBalancesProps) {
  const { address } = useAccount()
  const publicClient = usePublicClient()

  const { data: ethBalance } = useBalance({
    address,
  })

  return useQuery({
    queryKey: [
      "trade-balances",
      address,
      sendToken?.address,
      receiveToken?.address,
      ethBalance?.formatted,
    ],
    queryFn: async () => {
      if (!address || !sendToken || !receiveToken || !publicClient)
        return undefined

      try {
        // Use viem multicall to fetch balances directly
        const results = await publicClient.multicall({
          contracts: [
            {
              address: sendToken.address as Address,
              abi: erc20Abi,
              functionName: "balanceOf",
              args: [address],
            },
            {
              address: receiveToken.address as Address,
              abi: erc20Abi,
              functionName: "balanceOf",
              args: [address],
            },
          ],
          allowFailure: true,
        })

        const sendBalanceRaw =
          results[0]?.status === "success" ? results[0].result : 0n
        const receiveBalanceRaw =
          results[1]?.status === "success" ? results[1].result : 0n

        const sendBalanceFormatted = formatUnits(
          sendBalanceRaw,
          sendToken?.decimals || 18,
        )

        const receiveBalanceFormatted = formatUnits(
          receiveBalanceRaw,
          receiveToken?.decimals || 18,
        )

        const sendBalance = {
          token: sendToken,
          balance: sendBalanceRaw,
        }

        const receiveBalance = {
          token: receiveToken,
          balance: receiveBalanceRaw,
        }

        const sendBalanceWithEth =
          Number(
            formatUnits(sendBalance?.balance || 0n, sendToken?.decimals ?? 18),
          ) +
          Number(
            formatUnits(ethBalance?.value ?? 0n, ethBalance?.decimals ?? 18),
          )

        return {
          sendBalance,
          receiveBalance,
          receiveBalanceFormatted,
          sendBalanceFormatted,
          sendBalanceWithEth,
          ethBalance,
        }
      } catch (error) {
        console.error(error)
        return undefined
      }
    },
    enabled: !!address && !!sendToken && !!receiveToken && !!publicClient,
    refetchInterval: 10000, // 10 seconds
  })
}
