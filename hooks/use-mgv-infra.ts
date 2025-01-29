import { useDefaultChainId } from "@/utils/chains"

export function useMgvInfra() {
  const chainId = useDefaultChainId()
  return {
    mgvInfraUrl: `https://${chainId}-mgv-data.mgvinfra.com`,
    chainId,
  }
}
