"use client"

import getUserLocale from "get-user-locale"

export function formatNumber(
  value: number | bigint,
  options?: Intl.NumberFormatOptions | undefined,
) {
  return Intl.NumberFormat(getUserLocale(), {
    minimumSignificantDigits: 2,
    ...options,
  }).format(value)
}
