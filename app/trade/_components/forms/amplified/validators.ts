import { z } from "zod"

import { FIELD_ERRORS } from "@/utils/form-errors"

export const isGreaterThanZeroValidator = z.coerce
  .number()
  .gt(0, FIELD_ERRORS.fieldRequired)

export const isSelected = z.coerce.string()

export const sendValidator = (value: number) =>
  z.coerce
    .number()
    .gt(0, FIELD_ERRORS.fieldRequired)
    .lte(value, FIELD_ERRORS.insufficientBalance)
