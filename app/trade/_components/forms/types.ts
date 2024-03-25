import { SimpleAaveLogic } from "@mangrovedao/mangrove.js/dist/nodejs/logics/AaveV3/SimpleAaveLogic"
import { ZeroLendLogic } from "@mangrovedao/mangrove.js/dist/nodejs/logics/AaveV3/ZeroLendLogic"
import { OrbitLogic } from "@mangrovedao/mangrove.js/dist/nodejs/logics/OrbitLogic"
import { SimpleLogic } from "@mangrovedao/mangrove.js/dist/nodejs/logics/SimpleLogic"
import { MonoswapV3Logic } from "@mangrovedao/mangrove.js/dist/nodejs/logics/UniV3/MonoswapV3Logic"
import { ThrusterV3Logic } from "@mangrovedao/mangrove.js/dist/nodejs/logics/UniV3/ThrusterV3Logic"

import { PacFinanceLogic } from "@mangrovedao/mangrove.js/dist/nodejs/logics/AaveV3/PacFinanceLogic"
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

export type DefaultLogics =
  | SimpleLogic
  | SimpleAaveLogic
  | OrbitLogic
  | ZeroLendLogic
  | ThrusterV3Logic
  | MonoswapV3Logic
  | PacFinanceLogic
  | undefined
