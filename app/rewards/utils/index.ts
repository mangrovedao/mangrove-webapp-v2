import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInMonths,
  differenceInSeconds,
  formatDistanceToNow,
  formatDuration,
} from "date-fns"

export function formatNumber(num: number, locale = "en-US", currency = "USD") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 0,
  }).format(num)
}

export function formatTimestamp(timestamp: number): string {
  const distance = formatDistanceToNow(timestamp, { includeSeconds: true })

  const timeUnits: { [key: string]: string } = {
    d: "day",
    h: "hour",
    m: "minute",
    s: "second",
  }

  return Object.entries(timeUnits)
    .map(([shortForm, longForm]) => {
      const regex = new RegExp(
        `(\\d+) ${longForm}${longForm === "hour" ? "" : "s"}?`,
        "i",
      )
      const match = distance.match(regex)
      return match ? `${match[1]}${shortForm} ` : ""
    })
    .join("")
}

export function addDaysAndHours(days: number, hours: number): number {
  const now = new Date()
  const timestamp =
    now.getTime() + days * 24 * 60 * 60 * 1000 + hours * 60 * 60 * 1000
  return timestamp
}

export function getFormattedTimeFromNowTo(date: Date) {
  const today = new Date()
  const months = differenceInMonths(date, today)
  const days = differenceInDays(date, today) % 30
  const hours = differenceInHours(date, today) % 24
  const minutes = differenceInMinutes(date, today) % 60
  const seconds = differenceInSeconds(date, today) % 60

  return formatDuration({
    months,
    days,
    hours,
    minutes,
    seconds,
  })
}
