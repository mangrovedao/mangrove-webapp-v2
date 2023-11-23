"use client"

import { Button } from "@/components/ui/button"

export default function Page() {
  return (
    <main>
      <div className="w-full h-1/2 space-x-2 m-10 space-y-2">
        <Button size={"sm"}>Button</Button>
        <Button size={"sm"} variant={"outline"}>
          Button
        </Button>
        <br />
        <Button size={"md"}>Button</Button>
        <Button size={"md"} variant={"outline"}>
          Button
        </Button>
        <br />
        <Button size={"lg"}>Button</Button>
        <Button size={"lg"} variant={"outline"}>
          Button
        </Button>
        <br />
        <Button>Default</Button>
        <br />
        <Button disabled>Default</Button>
        <Button disabled variant={"outline"}>
          Default
        </Button>
      </div>

      <style jsx global>{`
        body {
          display: grid;
          grid-template:
            "header" var(--bar-height)
            "main" minmax(0, 1fr);
        }
      `}</style>

      <style jsx>{`
        main {
          display: grid;
          grid-area: main;
          max-height: calc(100vh - var(--bar-height));
          grid-template-columns: 20.5rem 1fr;
          grid-template-rows: auto var(--history-table-height);
          grid-template-areas:
            "trade content"
            "trade tables";
        }

        .tables-section {
          grid-area: tables;
        }

        .trade-section {
          grid-area: trade;
        }

        .fluid-section {
          display: grid;
          grid-area: content;
          grid-template-areas: "book chart";
          grid-template-columns: 20.5rem 1fr;
          grid-template-rows: minmax(
            0,
            calc(100vh - var(--bar-height) - var(--history-table-height))
          );
        }
      `}</style>
    </main>
  )
}
