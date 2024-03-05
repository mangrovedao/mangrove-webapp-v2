import { z } from "zod"

import { FIELD_ERRORS } from "@/utils/form-errors"

export const isGreaterThanZeroValidator = z.coerce
  .number()
  .gt(0, FIELD_ERRORS.fieldRequired)

export const sendValidator = (value: number) =>
  z.coerce
    .number()
    .gt(0, FIELD_ERRORS.fieldRequired)
    .lte(value, FIELD_ERRORS.insufficientBalance)

export const sendVolumeValidator = (value: number, minVolume: string) =>
  z.coerce.number().gte(value, `${FIELD_ERRORS.minVolume} ${minVolume}`)
