import { Title } from "@/components/typography/title"
import { InfoBanner } from "./_components/info-banner"
import { FaucetTable } from "./_components/table/table"

export default function Page() {
  return (
    <main className="max-w-6xl mx-auto px-4 pt-8 overflow-x-hidden">
      <InfoBanner />
      <Title className="mt-[56px]">Faucet</Title>
      <FaucetTable />
    </main>
  )
}
