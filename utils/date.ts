import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInMonths,
  differenceInSeconds,
  format,
  formatDistanceToNow,
  formatDuration,
  isPast,
} from "date-fns"

export function hasExpired(date: Date) {
  return isPast(new Date(date))
}

export function formatExpiryDate(date: Date) {
  if (hasExpired(date)) return "Expired"

  return formatDistanceToNow(date, {
    includeSeconds: true,
  })
}

export function formatDate(
  date: Date | string,
  formatString = "MM/dd/yyyy h:mm:ss aaaa",
) {
  const d = typeof date === "string" ? new Date(date) : date
  return format(d, formatString)
}

export function formatDateWithoutHours(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date
  return format(d, "dd MMM yyyy")
}

export function formatHoursOnly(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date
  return format(d, "h:mm")
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
