import { MyVaults } from "./my-vaults/my-vaults"
import { Vaults } from "./vaults/vaults"

import { Title } from "@/components/typography/title"
import { useAccount } from "wagmi"

export function Tables() {
  const { isConnected } = useAccount()

  return (
    <div className="pt-4 space-y-4">
      {isConnected && (
        <div className="grid gap-y-4">
          <Title variant={"title1"} className="pl-4">
            My positions
          </Title>
          <MyVaults />
        </div>
      )}

      <div className="grid gap-y-4">
        <div className="flex gap-2 w-full justify-between items-center">
          <Title variant={"title1"} className="pl-4">
            All Vaults
          </Title>
        </div>
        <Vaults />
      </div>
    </div>
  )
}
