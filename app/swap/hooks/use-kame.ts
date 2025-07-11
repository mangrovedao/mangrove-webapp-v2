import { checkAllowance } from "@/hooks/ghostbook/lib/allowance"
import {
  Api,
  FetchProviderConnector,
  GetQuoteParametersParams,
} from "@kame-ag/aggregator-sdk"
import { Address, Token as KameToken } from "@kame-ag/sdk-core"
import { Token as MgvToken } from "@mangrovedao/mgv"
import { useEffect, useMemo, useState } from "react"
import { erc20Abi, formatUnits, maxInt256, maxUint256, parseUnits, TransactionReceipt } from "viem"
import { useChainId, usePublicClient, useWalletClient } from "wagmi"

interface KameParams {
  payToken?: MgvToken
  receiveToken?: MgvToken
  payValue: string
  receiveValue: string
  onSwapError?: (e: any) => void
  onSwapSuccess?: (receipt: TransactionReceipt) => void
}

interface Quote {
  receive: string
  params: GetQuoteParametersParams
}

export function useKame({
  payToken,
  receiveToken,
  payValue,
  receiveValue,
  onSwapError,
  onSwapSuccess,
}: KameParams) {
  const aggregatorAPI = new Api({ httpConnector: new FetchProviderConnector() })
  const { data: walletClient } = useWalletClient()
  const [tokenPrices, setTokenPrices] = useState<
    { quotePrice: string; basePrice: string } | undefined
  >()
  const [quote, setQuote] = useState<Quote>()
  const chainId = useChainId()
  const publicClient = usePublicClient()

  useEffect(() => {
    const fetchPrices = async () => {
      if (!payToken || !receiveToken) return

      const { priceById: prices } = await aggregatorAPI.getPrices({
        ids: [payToken.address, receiveToken.address],
      })

      const apiReceiveToken = prices[receiveToken.address]
      const apiPayToken = prices[payToken.address]

      if (!apiPayToken || !apiReceiveToken) return

      setTokenPrices({
        quotePrice: apiReceiveToken.pyxis.price,
        basePrice: apiPayToken.pyxis.price,
      })
    }

    fetchPrices()
  }, [payToken, receiveToken])

  useEffect(() => {
    const fetchQuote = async () => {
      if (!payToken || !receiveToken || !chainId || !walletClient) return
      const amount = parseUnits(payValue, payToken.decimals).toString()
      const params = {
        fromToken: new KameToken(chainId, payToken.address, payToken.decimals),
        amount,
        toToken: new KameToken(
          chainId,
          receiveToken.address,
          receiveToken.decimals,
        ),
      }
      const quote = await aggregatorAPI.getQuote(params)
      console.log(quote)
      setQuote({
        receive: formatUnits(BigInt(quote.dstAmount), receiveToken.decimals),
        params,
      })
    }
    fetchQuote()
  }, [payToken, receiveToken, payValue, receiveValue])

  const usdAmounts = useMemo(() => {
    if (!tokenPrices) return

    const { quotePrice, basePrice } = tokenPrices

    if (!quotePrice || !basePrice) return

    const values = {
      quoteUsd: Number(quotePrice) * Number(receiveValue),
      baseUsd: Number(basePrice) * Number(payValue),
    }
    return values
  }, [tokenPrices, receiveValue, payValue])

  const isApproved = async (spender: any) => {
    if (!walletClient || !payToken || !publicClient) return false

    const allowance = await checkAllowance(
      walletClient,
      walletClient.account.address,
      spender,
      payToken.address,
    )
    if (allowance < maxUint256) {
      const hash = await walletClient.writeContract({
        address: payToken.address,
        abi: erc20Abi,
        functionName: "approve",
        args: [spender, maxUint256],
      })
      const res = await publicClient.waitForTransactionReceipt({ hash })
      return res.status === "success"
    }
    return true
  };

  const swap = async () => {
    if (!walletClient || !quote || !publicClient || !payToken) return

    try {
      const result = await aggregatorAPI.getSwap({
        ...quote.params,
        origin: new Address(walletClient?.account.address),
      })
      
      const approved = await isApproved(result.tx.to)
      if (!approved) return
      
      const hash = await walletClient.sendTransaction({
        account: walletClient.account.address,
        to: result.tx.to as `0x${string}`,
        data: result.tx.data as `0x${string}`,
        value: BigInt(result.tx.value),
      })

      const res = await publicClient.waitForTransactionReceipt({ hash })
      if (res.status === "success") {
        onSwapSuccess?.(res)
      } else {
        onSwapError?.(res)
      }
    } catch (e) {
      onSwapError?.(e)
    }
  }

  return {
    aggregatorAPI,
    usdAmounts,
    quote,
    swap,
  }
}
