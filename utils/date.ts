import { format, formatDistanceToNow, isPast } from "date-fns"

export function hasExpired(isoDate: string) {
  return isPast(new Date(isoDate))
}

export function formatExpiryDate(isoDate: string) {
  const expiryTime = new Date(isoDate)
  if (hasExpired(isoDate)) return "Expired"

  return formatDistanceToNow(expiryTime, {
    includeSeconds: true,
  })
}

export function formatDate(isoDate: string) {
  return format(new Date(isoDate), "MM/dd/yyyy h:mm:ss aaaa")
}
