declare module "symphony-sdk/viem" {
  export class Symphony {
    connectWalletClient(walletClient: any): void
    getRoute(
      tokenIn: string,
      tokenOut: string,
      amount: bigint,
    ): Promise<{
      route: {
        getConfig(): {
          apiUrl: string
          timeout: number
          chainId: number
          chainName: string
          rpcUrl: string
          nativeAddress: string
          wrappedNativeAddress: string
          slippage: number
          publicClient: any
          provider: any
          tokens: Record<string, any>
          additionalTokens: Record<string, any>
          overrideDefaultTokens: boolean
        }
        setConfig(options: Partial<any>): void
        swap(options?: {
          skipApproval?: boolean
          skipCheckApproval?: boolean
        }): Promise<{
          swapReceipt: any
          approveReceipt?: any
        }>
        giveApproval(): Promise<any>
        checkApproval(): Promise<boolean>
        refresh(): Promise<any>
        getRouteDetails(): any
        getTokenIn(): string
        getTokenOut(): string
        getSwapTypes(): number[][]
        getTokenList(): any[]
        getTotalAmountIn(): {
          amountIn: bigint
          amountInFormatted: string
          tokenIn: string
          tokenOut: string
        }
        getTotalAmountOut(): {
          amountOut: bigint
          amountOutFormatted: string
          tokenIn: string
          tokenOut: string
        }
      }
      amountIn: bigint
      amountInFormatted: string
      amountOut: bigint
      amountOutFormatted: string
      pathPercentages: number[]
      pathCount: number
      includesNative: boolean
    }>
    getTokenList(): string[]
    getConfig(): {
      apiUrl: string
      timeout: number
      chainId: number
      chainName: string
      rpcUrl: string
      nativeAddress: string
      wrappedNativeAddress: string
      slippage: number
      publicClient: any
      provider: any
      tokens: Record<string, any>
      additionalTokens: Record<string, any>
      overrideDefaultTokens: boolean
    }
  }
}
