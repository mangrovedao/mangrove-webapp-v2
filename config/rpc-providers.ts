/**
 * RPC provider configurations with fallback options
 */

// Base RPC URLs with their response times (used for priority)
export const baseRpcUrls = [
  { url: "https://base.rpc.subquery.network/public", responseTime: 0.083 },
  { url: "wss://base-rpc.publicnode.com", responseTime: 0.087 },
  { url: "wss://base.callstaticrpc.com", responseTime: 0.104 },
  { url: "wss://0xrpc.io/base", responseTime: 0.156 },
  { url: "https://0xrpc.io/base", responseTime: 0.184 },
  { url: "https://base-mainnet.public.blastapi.io", responseTime: 0.19 },
  { url: "https://base.llamarpc.com", responseTime: 0.208 },
  { url: "https://mainnet.base.org", responseTime: 0.225 },
  { url: "https://1rpc.io/base", responseTime: 0.227 },
  { url: "https://developer-access-mainnet.base.org", responseTime: 0.238 },
  { url: "https://base.meowrpc.com", responseTime: 0.241 },
  { url: "https://base.blockpi.network/v1/rpc/public", responseTime: 0.268 },
  { url: "https://base.drpc.org", responseTime: 0.269 },
  { url: "https://api.zan.top/base-mainnet", responseTime: 0.273 },
]

// Group RPC URLs by protocol type
const httpRpcUrls = baseRpcUrls
  .filter((provider) => provider.url.startsWith("https://"))
  .sort((a, b) => a.responseTime - b.responseTime)
  .map((provider) => provider.url)

const wsRpcUrls = baseRpcUrls
  .filter((provider) => provider.url.startsWith("wss://"))
  .sort((a, b) => a.responseTime - b.responseTime)
  .map((provider) => provider.url)

/**
 * Creates a fallback transport configuration for HTTP RPC URLs
 * @returns An array of HTTP URLs for Base chain, sorted by response time
 */
export function getBaseHttpTransport() {
  return httpRpcUrls
}

/**
 * Creates a fallback transport configuration for WebSocket RPC URLs
 * @returns An array of WebSocket URLs for Base chain, sorted by response time
 */
export function getBaseWsTransport() {
  return wsRpcUrls
}

/**
 * Gets the fastest HTTP RPC URL for the Base chain
 * @returns The fastest HTTP RPC URL
 */
export function getFastestBaseHttpRpc() {
  return httpRpcUrls[0]
}

/**
 * Gets the fastest WebSocket RPC URL for the Base chain
 * @returns The fastest WebSocket RPC URL
 */
export function getFastestBaseWsRpc() {
  return wsRpcUrls[0]
}
