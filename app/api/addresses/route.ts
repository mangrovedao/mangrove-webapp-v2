import { mangroveConfig } from "@/schemas/mangrove-config"
import { configuration } from "@mangrovedao/mangrove.js"

/** Returns all registered contract addresses for all networks. */
export function GET() {
  if (mangroveConfig) {
    configuration.updateConfiguration(mangroveConfig)
  }
  const allAddresses = configuration.addresses.getAllAddressesForAllNetworks()

  return Response.json(allAddresses)
}
