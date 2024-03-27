import { PacFinanceLogic } from "@mangrovedao/mangrove.js/dist/nodejs/logics/AaveV3/PacFinanceLogic"
import { SimpleAaveLogic } from "@mangrovedao/mangrove.js/dist/nodejs/logics/AaveV3/SimpleAaveLogic"
import { ZeroLendLogic } from "@mangrovedao/mangrove.js/dist/nodejs/logics/AaveV3/ZeroLendLogic"
import { OrbitLogic } from "@mangrovedao/mangrove.js/dist/nodejs/logics/OrbitLogic"
import { SimpleLogic } from "@mangrovedao/mangrove.js/dist/nodejs/logics/SimpleLogic"
import { MonoswapV3Logic } from "@mangrovedao/mangrove.js/dist/nodejs/logics/UniV3/MonoswapV3Logic"
import { ThrusterV3Logic } from "@mangrovedao/mangrove.js/dist/nodejs/logics/UniV3/ThrusterV3Logic"

export type DefaultStrategyLogics =
  | SimpleLogic
  | SimpleAaveLogic
  | OrbitLogic
  | ZeroLendLogic
  | MonoswapV3Logic
  | ThrusterV3Logic
  | PacFinanceLogic
  | undefined
