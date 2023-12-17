import { Title } from "@/components/typography/title"
import { Button } from "@/components/ui/button"
import { InfoBanner } from "./components/info-banner/info-banner"
import { Tables } from "./components/tables/tables"

export default function Page() {
  return (
    <main className="max-w-8xl mx-auto px-4 pt-8 overflow-x-hidden">
      <InfoBanner />
      <div className="mt-[56px] flex justify-between items-center">
        <Title>Strategies</Title>
        <Button size={"lg"} rightIcon>
          Create strategy
        </Button>
      </div>
      <Tables />
    </main>
  )
}
