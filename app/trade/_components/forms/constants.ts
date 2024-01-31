/* eslint-disable @typescript-eslint/ban-ts-comment */
import type { TradeModeAndActionPresentation } from "./types"

export const TRADEMODE_AND_ACTION_PRESENTATION: TradeModeAndActionPresentation =
  {
    limit: {
      buy: {
        baseQuoteToSendReceive: (base, quote) => [quote, base],
        baseQuoteToApproveToken: (_, quote) => quote,
        sendReceiveToBaseQuote: (send, receive) => [receive, send],
      },
      sell: {
        baseQuoteToSendReceive: (base, quote) => [base, quote],
        baseQuoteToApproveToken: (base, _) => base,
        sendReceiveToBaseQuote: (send, receive) => [send, receive],
      },
    },
    amplified: {
      buy: {
        baseQuoteToSendReceive: (base, quote) => [quote, base],
        baseQuoteToApproveToken: (_, quote) => quote,
        sendReceiveToBaseQuote: (send, receive) => [receive, send],
      },
      sell: {
        baseQuoteToSendReceive: (base, quote) => [base, quote],
        baseQuoteToApproveToken: (base, _) => base,
        sendReceiveToBaseQuote: (send, receive) => [send, receive],
      },
    },
    market: {
      buy: {
        baseQuoteToSendReceive: (base, quote) => [quote, base],
        baseQuoteToApproveToken: (_, quote) => quote,
        sendReceiveToBaseQuote: (send, receive) => [receive, send],
      },
      sell: {
        baseQuoteToSendReceive: (base, quote) => [base, quote],
        baseQuoteToApproveToken: (base, _) => base,
        sendReceiveToBaseQuote: (send, receive) => [send, receive],
      },
    },
  }
