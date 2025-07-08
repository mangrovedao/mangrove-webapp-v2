// Define interface for normalized stats
interface NormalizedStats {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export const normalizeStats = (
  data:
    | {
        open: number | null
        close: number | null
        baseVolume: number | null
        quoteVolume: number | null
        minPrice: number | null
        maxPrice: number | null
      }
    | {
        timestamp: number
        open: number
        high: number
        low: number
        close: number
        volume: number
      }
    | null
    | undefined,
): NormalizedStats | null => {
  console.log('data', data)
  if (!data) return null

  // If data already has the new format (high, low, volume)
  if ("high" in data && "low" in data && "volume" in data) {
    return data as NormalizedStats
  }

  // Transform old format to new format
  return {
    timestamp: Date.now(),
    open: Number(data.open) || 0,
    high: Number(data.maxPrice) || 0,
    low: Number(data.minPrice) || 0,
    close: Number(data.close) || 0,
    volume: Number(data.quoteVolume) || 0,
  }
}
