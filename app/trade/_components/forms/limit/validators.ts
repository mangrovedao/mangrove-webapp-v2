import { z } from "zod"

import { FIELD_ERRORS } from "@/utils/form-errors"

export const isGreaterThanZeroValidator = z.coerce
  .number()
  .gt(0, FIELD_ERRORS.fieldRequired)

export const sendValidator = (value: number) =>
  z.coerce
    .number()
    .gt(0, FIELD_ERRORS.insufficientBalance)
    .lte(value, FIELD_ERRORS.insufficientBalance)

export const sendVolumeValidator = (
  balance: number,
  volume: number,
  symbol: string,
) =>
  z.coerce
    .number()
    .lte(balance, FIELD_ERRORS.insufficientBalance)
    .gte(volume, `${FIELD_ERRORS.minVolume} ${volume} ${symbol}`)
