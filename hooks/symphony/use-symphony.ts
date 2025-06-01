import { Symphony } from "symphony-sdk/viem"
import { Address } from "viem"
import { useWalletClient } from "wagmi"

export function useSymphony() {
  const { data: walletClient } = useWalletClient()
  const symphonySDK = new Symphony()
  const tokenList = symphonySDK.getTokenList()
  const nativeAddress = symphonySDK.getConfig().nativeAddress

  symphonySDK.connectWalletClient(walletClient)

  const getRoute = async (
    tokenIn: Address,
    tokenOut: Address,
    amount: bigint,
  ) => {
    return await symphonySDK.getRoute(tokenIn, tokenOut, amount)
  }
  const refreshRoute = async (route: any) => {
    return await route.refresh()
  }

  const swap = async (route: any) => {
    const transaction = await route.swap()
    return transaction.swapReceipt.transactionHash
  }

  const isApproved = async (route: any) => {
    return await route.checkApproval()
  }

  const approveRoute = async (route: any) => {
    return await route.giveApproval()
  }

  return {
    // routes
    getRoute,
    refreshRoute,

    // approval
    isApproved,
    approveRoute,

    // swap
    swap,

    // tokens
    tokenList,
    nativeAddress,
  }
}
