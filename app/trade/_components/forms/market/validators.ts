import { z } from "zod"

import { FIELD_ERRORS } from "@/utils/form-errors"

export const isGreaterThanZeroValidator = z.coerce
  .number()
  .gt(0, FIELD_ERRORS.fieldRequired)

export const sendValidator = (value: number) =>
  value == 0
    ? z.coerce.number().gt(0, FIELD_ERRORS.insufficientBalance)
    : z.coerce
        .number()
        .lte(value, FIELD_ERRORS.insufficientBalance)
        .gt(0, FIELD_ERRORS.fieldRequired)
