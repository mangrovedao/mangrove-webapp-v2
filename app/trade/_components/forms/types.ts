import { type TradeAction, type TradeMode } from "./enums"

type TradeModeValue = `${TradeMode}`
type TradeActionValue = `${TradeAction}`
export type TradeModeAndActionPresentation = {
  [key in TradeModeValue]: {
    [key in TradeActionValue]: {
      baseQuoteToSendReceive: <T>(base: T, quote: T) => [T, T]
      baseQuoteToApproveToken: <T>(base: T, quote: T) => T
      sendReceiveToBaseQuote: <T>(send: T, receive: T) => [T, T]
    }
  }
}
