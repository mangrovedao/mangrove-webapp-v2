import { TimeToLiveUnit } from "./enums"

function getNumberOfSeconds(timeToLiveUnit: `${TimeToLiveUnit}`) {
  let seconds: number
  switch (timeToLiveUnit) {
    case TimeToLiveUnit.DAY:
      seconds = 86400
      break
    case TimeToLiveUnit.HOUR:
      seconds = 3600
      break
    case TimeToLiveUnit.MIN:
      seconds = 60
      break
    default:
      throw new Error("Not implemented")
  }
  return seconds
}

export function estimateTimestamp({
  timeToLiveUnit,
  timeToLive,
}: {
  timeToLiveUnit: `${TimeToLiveUnit}` | null
  timeToLive: string
}) {
  const seconds = getNumberOfSeconds(timeToLiveUnit ?? TimeToLiveUnit.DAY)
  return Math.trunc(Date.now() / 1000 + seconds * parseInt(timeToLive))
}

function getFormattedUnit(timeToLiveUnit: `${TimeToLiveUnit}` | undefined) {
  let formattedUnit: string
  switch (timeToLiveUnit) {
    case TimeToLiveUnit.DAY:
      formattedUnit = "day"
      break
    case TimeToLiveUnit.HOUR:
      formattedUnit = "hour"
      break
    case TimeToLiveUnit.MIN:
      formattedUnit = "minute"
      break
    default:
      throw new Error("Not implemented")
  }
  return formattedUnit
}

export function getFormattedTimeToLive(
  timeToLiveValue: string | undefined,
  timeToLiveUnit?: `${TimeToLiveUnit}` | null,
) {
  return `${timeToLiveValue} ${getFormattedUnit(
    timeToLiveUnit ?? TimeToLiveUnit.DAY,
  )}${Number(timeToLiveValue) > 1 ? "s" : ""}`
}

export const sourceIcons: { [key: string]: JSX.Element } = {
  MonoSwap: (
    <img
      src="/assets/liquiditySources/monoswap.webp"
      alt="monoswap-icon"
      width="15"
      height="15"
    />
  ),
  Thruster: (
    <img
      src="/assets/liquiditySources/thruster.svg"
      alt="thruster-icon"
      width="18"
      height="24"
    />
  ),
  PacFinance: (
    <img
      src="/assets/liquiditySources/pac.svg"
      alt="pac-finance-icon"
      width="18"
      height="24"
    />
  ),
  ZeroLend: (
    <img
      src="/assets/liquiditySources/zerolend.webp"
      alt="zero-lend-icon"
      width="18"
      height="24"
    />
  ),
  Orbit: (
    <img
      src="/assets/liquiditySources/orbit.webp"
      alt="orbit-icon"
      width="24"
      height="24"
    />
  ),
  Aave: (
    <img
      src="/assets/liquiditySources/aave.svg"
      alt="aave-icon"
      width="18"
      height="24"
    />
  ),
  Stargate: (
    <img
      src="/assets/liquiditySources/stargate.svg"
      alt="stargate-icon"
      width="18"
      height="24"
    />
  ),
  Beefy: (
    <img
      src="/assets/liquiditySources/beefy.svg"
      alt="beefy-icon"
      width="18"
      height="24"
    />
  ),
}
