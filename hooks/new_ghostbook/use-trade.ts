import { MarketParams } from "@mangrovedao/mgv"
import {
  BS,
  getSemibooksOLKeys,
  marketOrderResultFromLogs,
} from "@mangrovedao/mgv/lib"
import { useCallback, useMemo, useState } from "react"
import { encodeAbiParameters, Hex, parseAbi, parseEventLogs } from "viem"
import { useChainId, usePublicClient, useWalletClient } from "wagmi"
import { mangroveChains } from "../ghostbook/lib/registry"
import {
  JellyVerseV2Pool,
  Pool,
  SlipstreamPool,
  UniswapV3Pool,
} from "./use-pools"
import { useSelectedPool } from "./use-selected-pool"

type UseTradeProps = {
  market?: MarketParams
}

type TradeParams = {
  bs: BS
  sendAmount: bigint
  maxTick: bigint
}

const abi = parseAbi([
  "struct OLKey { address outbound_tkn; address inbound_tkn; uint256 tickSpacing; }",
  "struct ModuleData { address module; bytes data; }",
  "function marketOrderByTick(OLKey memory olKey, int256 maxTick, uint256 amountToSell, ModuleData calldata moduleData) public returns (uint256 takerGot, uint256 takerGave, uint256 bounty, uint256 feePaid)",
])

const orderCompletedAbi = [
  {
    type: "event",
    name: "OrderCompleted",
    inputs: [
      { indexed: true, name: "taker", type: "address" },
      { indexed: true, name: "olKeyHash", type: "bytes32" },
      { indexed: false, name: "got", type: "uint256" },
      { indexed: false, name: "gave", type: "uint256" },
      { indexed: false, name: "fee", type: "uint256" },
      { indexed: false, name: "bounty", type: "uint256" },
    ],
  },
]

function isUniswapV3Pool(pool: Pool): pool is UniswapV3Pool {
  return pool.protocol.type === "UNISWAP_V3"
}

function isSlipstreamPool(pool: Pool): pool is SlipstreamPool {
  return pool.protocol.type === "Slipstream"
}

function isJellyVerseV2Pool(pool: Pool): pool is JellyVerseV2Pool {
  return pool.protocol.type === "JELLYVERSE_V2"
}

function poolToModuleData(pool: Pool) {
  if (isUniswapV3Pool(pool)) {
    return encodeAbiParameters(
      [{ type: "address" }, { type: "uint24" }],
      [pool.protocol.router, pool.fee],
    )
  }
  if (isJellyVerseV2Pool(pool)) {
    return encodeAbiParameters(
      [{ type: "address" }, { type: "bytes32" }, { type: "uint256" }],
      [
        pool.protocol.vault,
        pool.poolId as Hex,
        BigInt(Math.floor(Date.now() / 1000 + 3600)),
      ],
    )
  }
}

export function useGhostBookTrade({ market }: UseTradeProps) {
  const chainId = useChainId()
  const { selectedPool: bestPool } = useSelectedPool()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()

  const [bs, setBs] = useState<BS>(BS.buy)
  const [result, setResult] =
    useState<ReturnType<typeof marketOrderResultFromLogs>>()

  const mangroveChain = useMemo(() => {
    return mangroveChains.find((chain) => chain.chain.id === chainId)
  }, [chainId])

  const ghostbook = mangroveChain?.ghostbook
  const v3Module = mangroveChain?.univ3Module
  const balancerV2Module = mangroveChain?.balancerV2Module
  const mangrove = mangroveChain?.mangroveParams

  const trade = useCallback(
    async (params: TradeParams) => {
      if (!bestPool || !ghostbook || !market || !walletClient) return
      const moduleAddress =
        bestPool.protocol.type === "UNISWAP_V3" ? v3Module : balancerV2Module
      if (!moduleAddress) return
      const moduleData = poolToModuleData(bestPool as Pool)
      if (!moduleData) return
      const keys = getSemibooksOLKeys(market)
      const olKey = params.bs === BS.buy ? keys.asksMarket : keys.bidsMarket
      setBs(params.bs)

      const hash = await walletClient.writeContract({
        address: ghostbook,
        abi,
        functionName: "marketOrderByTick",
        args: [
          olKey,
          params.maxTick,
          params.sendAmount,
          {
            module: moduleAddress,
            data: moduleData,
          },
        ],
        gas: BigInt(500_000),
      })

      const receipt = await publicClient?.waitForTransactionReceipt({ hash })

      if (receipt?.status === "success" && mangrove && ghostbook && market) {
        const parsedLogs = parseEventLogs({
          abi: orderCompletedAbi,
          logs: receipt.logs,
        })

        const orderCompletedLog: any = parsedLogs.find((log) => {
          return (log as any).eventName === "OrderCompleted"
        })

        const formatted = {
          takerGot: orderCompletedLog?.args.got,
          takerGave: orderCompletedLog?.args.gave,
          feePaid: orderCompletedLog?.args.fee,
          bounty: orderCompletedLog?.args.bounty,
        }

        return { result: formatted, receipt, hash }
      }

      return { receipt, hash }
    },
    [
      bestPool,
      ghostbook,
      market,
      v3Module,
      balancerV2Module,
      walletClient,
      publicClient,
      mangrove,
    ],
  )

  return {
    trade,
    result,
  }
}
