export enum TradeMode {
  LIMIT = "limit",
  MARKET = "market",
}
export enum TradeAction {
  BUY = "buy",
  SELL = "sell",
}
export type TradeModeValue = `${TradeMode}`
export type TradeActionValue = `${TradeAction}`
export type TradeModeAndActionPresentation = {
  [key in TradeModeValue]: {
    [key in TradeActionValue]: {
      baseQuoteToSendReceive: <T>(base: T, quote: T) => [T, T]
      baseQuoteToApproveToken: <T>(base: T, quote: T) => T
      sendReceiveToBaseQuote: <T>(send: T, receive: T) => [T, T]
    }
  }
}
