import { Button } from "@/components/ui/button"

export default function Page() {
  const handleClick = (size: string) => {
    console.log(`Button ${size} clicked`)
  }

  return (
    <main className="flex flex-col min-h-screen max-w-7xl mx-auto">
      <div className="space-x-2">
        <Button size="xxs">Primary XXS</Button>
        <Button size="xs">Primary XS</Button>
        <Button size="sm">Primary SM</Button>
        <Button size="md">Primary MD</Button>
        <Button size="lg">Primary LG</Button>
        <Button size="xl">Primary XL</Button>
        <Button size="xl" disabled>
          Primary XL
        </Button>
      </div>
      <div className="space-x-2 mt-10">
        <Button variant={"secondary"} size="xxs">
          Secondary XXS
        </Button>
        <Button variant={"secondary"} size="xs">
          Secondary XS
        </Button>
        <Button variant={"secondary"} size="sm">
          Secondary SM
        </Button>
        <Button variant={"secondary"} size="md">
          Secondary MD
        </Button>
        <Button variant={"secondary"} size="lg">
          Secondary LG
        </Button>
        <Button variant={"secondary"} size="xl">
          Secondary XL
        </Button>
        <Button variant={"secondary"} size="xl" disabled>
          Secondary XL
        </Button>
      </div>
    </main>
  )
}
