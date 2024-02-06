import { configuration } from "@mangrovedao/mangrove.js"

/** Returns all registered contract addresses for all networks. */
export function GET() {
  const allAddresses = configuration.addresses.getAllAddressesForAllNetworks();

  return Response.json(allAddresses)
}
