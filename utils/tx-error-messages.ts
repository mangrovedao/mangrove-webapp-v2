export function getTitleDescriptionErrorMessages(error: Error) {
  const { message } = error
  const messageLower = message.toLowerCase()

  if (
    messageLower.includes("connection request reset") ||
    messageLower.includes("rejected") ||
    messageLower.includes("reject") ||
    messageLower.includes("cancelled") ||
    messageLower.includes("canceled") ||
    messageLower.includes("user denied")
  ) {
    return {
      title: "Transaction rejected",
      description: "You rejected the transaction.",
    }
  }

  return {
    title: "Transaction failed",
    description: "An error occurred while trying to send the transaction.",
  }
}
