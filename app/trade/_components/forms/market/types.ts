import { BS } from "@mangrovedao/mgv/lib"

export type Form = {
  bs: BS
  send: string
  receive: string
  slippage: number
  estimatedFee?: string
  isWrapping: boolean
}
