import { create, type StateCreator } from "zustand"
import { TimeInForce, TimeToLiveUnit } from "../enums"
import { Asset } from "../types"

export type ChangingFrom =
  | "sendSource"
  | "sendAmount"
  | "sendToken"
  | "assets"
  | "timeInForce"
  | "timeToLive"
  | "timeToLiveUnit"
  | undefined
  | null

export type NewStratStore = {
  sendSource: string
  sendAmount: string
  sendToken: string
  assets: Asset[]
  timeInForce: TimeInForce
  timeToLive: string
  timeToLiveUnit: TimeToLiveUnit

  isChangingFrom: ChangingFrom
  globalError?: string
  errors: Record<string, string>
}

type NewStratActions = {
  setSendSource: (source: string) => void
  setSendAmount: (amount: string) => void
  setSendToken: (token: string) => void
  setAssets: (assets: Asset[]) => void
  setTimeInForce: (timeInForce: TimeInForce) => void
  setTimeToLive: (timeInForce: string) => void
  setTimeToLiveUnit: (timeInForce: TimeToLiveUnit) => void

  setGlobalError: (error?: string) => void
  setErrors: (errors: Record<string, string>) => void
  setIsChangingFrom: (isChangingFrom: ChangingFrom) => void
}

const newStratStateCreator: StateCreator<NewStratStore & NewStratActions> = (
  set,
) => ({
  sendSource: "",
  sendAmount: "",
  sendToken: "",
  assets: [
    {
      amount: "",
      token: "",
      limitPrice: "",
      receiveTo: "simple",
    },
    {
      amount: "",
      token: "",
      limitPrice: "",
      receiveTo: "simple",
    },
  ],
  timeInForce: TimeInForce.GOOD_TIL_TIME,
  timeToLive: "28",
  timeToLiveUnit: TimeToLiveUnit.DAY,

  isChangingFrom: null,
  globalError: undefined,
  errors: {},

  setSendSource: (sendSource) => set({ sendSource }),
  setSendAmount: (sendAmount) => set({ sendAmount }),
  setSendToken: (sendToken) => set({ sendToken }),
  setAssets: (assets) => set({ assets }),
  setTimeInForce: (timeInForce) => set({ timeInForce }),
  setTimeToLive: (timeToLive) => set({ timeToLive }),
  setTimeToLiveUnit: (timeToLiveUnit) => set({ timeToLiveUnit }),

  setGlobalError: (globalError) => set({ globalError }),
  setErrors: (errors) => set({ errors }),
  setIsChangingFrom: (isChangingFrom) => set({ isChangingFrom }),
})

export const useNewStratStore = create(newStratStateCreator)
