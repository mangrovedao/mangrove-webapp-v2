import {
  createPublicClient,
  fallback,
  http,
  webSocket,
  type Chain,
  type PublicClient,
  type Transport,
} from "viem"
import { getBaseHttpTransport, getBaseWsTransport } from "./rpc-providers"

/**
 * Creates a fallback transport configuration for HTTP RPC calls
 * Uses multiple RPC URLs to ensure reliable connections
 *
 * @param chain The chain to create the transport for
 * @param useWebSockets Whether to use WebSockets (if available) as the primary transport
 * @returns A fallback transport configuration
 */
export function createFallbackTransport(
  chain: Chain,
  useWebSockets: boolean = false,
): Transport {
  // Currently only supports Base chain
  if (chain.id === 8453) {
    // Get both HTTP and WebSocket URLs
    const httpUrls = getBaseHttpTransport()
    const wsUrls = getBaseWsTransport()

    // Create transport arrays
    let primaryTransports: Transport[] = []
    let secondaryTransports: Transport[] = []

    // Configure based on preferred transport type
    if (useWebSockets && wsUrls.length > 0) {
      // Use WebSockets as primary, HTTP as fallback
      primaryTransports = wsUrls.map((url) => webSocket(url))
      secondaryTransports = httpUrls.map((url) => http(url))
    } else {
      // Use HTTP as primary, WebSockets as fallback (if available)
      primaryTransports = httpUrls.map((url) => http(url))
      if (wsUrls.length > 0) {
        secondaryTransports = wsUrls.map((url) => webSocket(url))
      }
    }

    // Combine all transports (primary ones first)
    const allTransports = [...primaryTransports, ...secondaryTransports]

    return fallback(allTransports)
  }

  // Default to standard http transport for unsupported chains
  return http()
}

/**
 * Creates a public client with fallback transport for increased reliability
 *
 * @param chain The chain to create the client for
 * @param useWebSockets Whether to use WebSockets as the primary transport
 * @returns A public client with fallback transport
 */
export function createFallbackPublicClient(
  chain: Chain,
  useWebSockets: boolean = false,
): PublicClient {
  return createPublicClient({
    chain,
    transport: createFallbackTransport(chain, useWebSockets),
  })
}
