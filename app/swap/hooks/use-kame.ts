import { checkAllowance } from "@/hooks/ghostbook/lib/allowance"
import {
  Api,
  FetchProviderConnector,
  GetQuoteParametersParams,
} from "@kame-ag/aggregator-sdk"
import { Address, Token as KameToken } from "@kame-ag/sdk-core"
import { Token as MgvToken } from "@mangrovedao/mgv"
import { useEffect, useMemo, useRef, useState } from "react"
import {
  erc20Abi,
  formatUnits,
  maxUint256,
  parseUnits,
  TransactionReceipt,
} from "viem"
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
  forToken: MgvToken
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
  const [fetchingQuote, setFetchingQuote] = useState<"pay" | "receive" | null>(
    null,
  )
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

  // useEffect(() => {    
  //   const fetchQuote = async () => {
  //     if (!payToken || !receiveToken || !chainId || !walletClient || !payValue)
  //       return

  //     console.log('refeshing quote')
      
  //     const isCalculatingReceive = fetchingQuote === "receive"
  //     const fromToken = isCalculatingReceive ? payToken : receiveToken
  //     const value = isCalculatingReceive ? payValue : receiveValue
  //     const toToken = isCalculatingReceive ? receiveToken : payToken

  //     const amount = parseUnits(value, payToken.decimals).toString()
  //     const params = {
  //       fromToken: new KameToken(chainId, fromToken.address, fromToken.decimals),
  //       amount,
  //       toToken: new KameToken(
  //         chainId,
  //         toToken.address,
  //         toToken.decimals,
  //       ),
  //     }
  //     const _quote = await aggregatorAPI.getQuote(params)
  //     console.log("_quote", _quote, formatUnits(BigInt(_quote.dstAmount), toToken.decimals))
  //     setQuote({
  //       receive: formatUnits(BigInt(_quote.dstAmount), toToken.decimals),
  //       params,
  //     })
  //     setFetchingQuote(null)
  //   }
  //   fetchQuote()
  // }, [payToken, receiveToken, payValue, receiveValue])

    const debounceRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!fetchingQuote) return

    if (!payToken || !receiveToken || !chainId || !walletClient || !fetchingQuote) return

    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(() => {
      const fetchQuote = async () => {
        const isCalculatingReceive = fetchingQuote === "receive"
        const fromToken = isCalculatingReceive ? payToken : receiveToken
        const toToken = isCalculatingReceive ? receiveToken : payToken
        const value = isCalculatingReceive ? payValue : receiveValue

        if (!value) return

        const amount = parseUnits(value, fromToken.decimals).toString()

        const params = {
          fromToken: new KameToken(chainId, fromToken.address, fromToken.decimals),
          amount,
          toToken: new KameToken(chainId, toToken.address, toToken.decimals),
        }

        try {
          const _quote = await aggregatorAPI.getQuote(params)
          setQuote({
            forToken: toToken,
            receive: formatUnits(BigInt(_quote.dstAmount), toToken.decimals),
            params,
          })
        } catch (err) {
          console.error("Failed to fetch quote", err)
        } finally {
          setFetchingQuote(null)
        }
      }

      fetchQuote()
    }, 300) // 300ms debounce delay

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [
    payToken,
    receiveToken,
    payValue,
    receiveValue,
    chainId,
    walletClient,
    fetchingQuote,
  ])

  const usdAmounts = useMemo(() => {
    if (!tokenPrices) return

    const { quotePrice, basePrice } = tokenPrices

    if (!quotePrice || !basePrice) return

    const values = {
      quoteUsd: Number(quotePrice) * Number(receiveValue),
      baseUsd: Number(basePrice) * Number(payValue),
    }
    console.log('value', values)
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
  }

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
    fetchingQuote,
    setFetchingQuote,
  }
}
