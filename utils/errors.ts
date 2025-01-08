import { BaseError, TransactionExecutionError } from "viem"

import { ContractFunctionExecutionError } from "viem"

type ErrorWithMessage = {
  message: string
}
export function printEvmError(error: unknown) {
  console.error(error)

  if (error instanceof BaseError) {
    const revertError = error.walk(
      (error) => error instanceof TransactionExecutionError,
    )

    if (revertError instanceof TransactionExecutionError) {
      console.log(revertError.cause, revertError.message, revertError.details)
    }
  }

  if (error instanceof BaseError) {
    const revertError = error.walk(
      (error) => error instanceof ContractFunctionExecutionError,
    )

    if (revertError instanceof ContractFunctionExecutionError) {
      console.log(
        revertError.stack,
        revertError.args,
        revertError.cause,
        revertError.message,
        revertError.functionName,
        revertError.formattedArgs,
        revertError.details,
        revertError,
      )
    }
  }
}

function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as Record<string, unknown>).message === "string"
  )
}

function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
  if (isErrorWithMessage(maybeError)) return maybeError

  try {
    return new Error(JSON.stringify(maybeError))
  } catch {
    // fallback in case there's an error stringifying the maybeError
    // like with circular references for example.
    return new Error(String(maybeError))
  }
}

export function getErrorMessage(error: unknown) {
  return toErrorWithMessage(error).message
}
