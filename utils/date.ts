import { format, formatDistanceToNow, isPast } from "date-fns"

export function hasExpired(date: Date) {
  return isPast(new Date(date))
}

export function formatExpiryDate(date: Date) {
  if (hasExpired(date)) return "Expired"

  return formatDistanceToNow(date, {
    includeSeconds: true,
  })
}

export function formatDate(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date
  return format(d, "MM/dd/yyyy h:mm:ss aaaa")
}
