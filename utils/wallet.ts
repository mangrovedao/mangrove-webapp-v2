export function getWalletIcon(name: string) {
  const cdn = `https://explorer-api.walletconnect.com/v2/logo/lg`
  const fallback = "09a83110-5fc3-45e1-65ab-8f7df2d6a400"
  const presets: Record<string, string | undefined> = {
    "Brave Wallet": "125e828e-9936-4451-a8f2-949c119b7400",
    MetaMask: "619537c0-2ff3-4c78-9ed8-a05e7567f300",
    "Coinbase Wallet": "f8068a7f-83d7-4190-1f94-78154a12c600",
    "Ledger Live": "39890ad8-5b2e-4df6-5db4-2ff5cf4bb300",
    Exodus: "4c16cad4-cac9-4643-6726-c696efaf5200",
  }

  return `${cdn}/${presets[name] ?? fallback}`
}

export const shortenAddress = (address: string, length = 7): string =>
  address ? `${address.substr(0, length - 1)}...${address.substr(-length)}` : ""
