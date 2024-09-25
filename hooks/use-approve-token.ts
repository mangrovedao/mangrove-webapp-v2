import type { Token } from "@mangrovedao/mgv";
import { useMutation } from "@tanstack/react-query";
import { type Address, erc20Abi, maxUint256 } from "viem";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";

export function useApproveToken() {
  const { address: userAddress } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  return useMutation({
    mutationFn: async ({
      token,
      spender,
      amountToApprove = maxUint256,
    }: {
      token?: Token;
      spender?: string | null;
      amountToApprove?: bigint;
    }) => {
      try {
        if (!(token && spender && publicClient && walletClient)) return;

        const { request } = await publicClient.simulateContract({
          address: token.address,
          abi: erc20Abi,
          functionName: "approve",
          args: [spender as Address, amountToApprove],
          account: userAddress,
        });

        const hash = await walletClient.writeContract(request);
        const receipt = await publicClient.waitForTransactionReceipt({
          hash,
        });

        return receipt;
      } catch (error) {
        console.error(error);
        throw new Error("Failed the approval");
      }
    },
    meta: {
      error: "Failed the approval",
      success: "The approval has been successfully set",
    },
  });
}
