import useMarket from "@/providers/market"
import { Logic } from "@mangrovedao/mgv"
import type { GetBalanceResult } from "@mangrovedao/mgv/actions/balances"
import { useQuery } from "@tanstack/react-query"
import { isAddressEqual, type Address } from "viem"
import { useAccount } from "wagmi"

import { useLogics } from "./use-addresses"
import { useGeneralClient } from "./use-client"

export type UseUserBalancesParams = {
  user?: Address
}

export function useUserBalances(params: UseUserBalancesParams) {
  const generalClient = useGeneralClient()
  const { markets } = useMarket()
  const logics = useLogics()
  const { data, isLoading, isError } = useQuery({
    queryKey: [
      "balances",
      generalClient?.chain.id,
      params.user,
      markets.map((m) => `${m.base.address}-${m.quote.address}`),
      logics.map((l) => l.logic),
    ],
    queryFn: async () => {
      if (!generalClient || !params.user) return undefined
      return generalClient.getBalances({
        user: params.user,
        logics: logics as Logic[],
        markets,
      })
    },
    enabled: !!generalClient && !!params.user && markets.length > 0,
  })
  return { balances: data, isLoading, isError }
}

export function useBalances() {
  const { address } = useAccount()
  return useUserBalances({ user: address })
}

export type UseTokenBalanceParams<
  TToken extends Address | undefined = undefined,
  TLogic extends Address | undefined = undefined,
> = {
  token?: TToken
  logic?: TLogic
}

export type UseTokenBalanceResult<
  TToken extends Address | undefined = undefined,
  TLogic extends Address | undefined = undefined,
> = Omit<ReturnType<typeof useBalances>, "balances"> & {
  balance: TToken extends undefined
    ? undefined
    : TLogic extends undefined
      ? GetBalanceResult["tokens"][number] | undefined
      : GetBalanceResult["logicBalances"][number] | undefined
}

export function useTokenBalance<
  TToken extends Address | undefined = undefined,
  TLogic extends Address | undefined = undefined,
>({
  token,
  logic,
}: UseTokenBalanceParams<TToken, TLogic>): UseTokenBalanceResult<
  TToken,
  TLogic
> {
  const { balances, ...rest } = useBalances()
  const balance:
    | GetBalanceResult["tokens"][number]
    | GetBalanceResult["logicBalances"][number]
    | undefined = token
    ? logic
      ? balances?.logicBalances.find(
          (b) =>
            isAddressEqual(b.logic.logic, logic) &&
            isAddressEqual(b.token.address, token),
        )
      : balances?.tokens.find((t) => isAddressEqual(t.token.address, token))
    : undefined
  return { balance, ...rest } as unknown as UseTokenBalanceResult<
    TToken,
    TLogic
  >
}

export type UseTokenLogicsParams = {
  token?: Address
}

export function useTokenLogics({ token }: UseTokenLogicsParams) {
  const { balances, ...rest } = useBalances()
  const logics = token
    ? balances?.overlying.filter(
        (b) => b.available && isAddressEqual(b.token.address, token),
      ) || []
    : []
  return { logics, ...rest }
}
