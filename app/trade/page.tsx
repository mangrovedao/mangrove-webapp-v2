"use client"
import MarketSelector from "@/components/stateful/market-selector"
import MarketInfoBar from "./components/market-infos-bar"
import Market from "./sections/market/market"
import Book from "./sections/orderbook/orderbook"
import Trade from "./sections/trade/trade"

export default function Page() {
  return (
    <main>
      <section className="trade-section">
        <div className="px-4 border-b h-[var(--bar-height)] flex items-center">
          <MarketSelector />
        </div>
        <Trade />
      </section>

      <section className="border-x fluid-section">
        <Book
          className="overflow-hidden border-r"
          style={{ gridArea: "book" }}
        />
        <div
          style={{
            gridArea: "chart",
          }}
        >
          <MarketInfoBar />
          <Market
            className="w-full border-t "
            style={{
              height: "calc(100% - var(--bar-height))",
            }}
          />
        </div>
      </section>

      <section className="overflow-y-auto border-x border-t tables-section z-50 bg-background">
        <Tables />
      </section>

      <style jsx global>{`
        body {
          display: grid;
          grid-template:
            "header" var(--bar-height)
            "main" minmax(0, 1fr);
          overflow: hidden;
        }
      `}</style>

      <style jsx>{`
        main {
          display: grid;
          grid-area: main;
          grid-template-columns: 20.5rem minmax(0, 1fr);
          grid-template-rows: 1fr var(--history-table-height);
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
          grid-template-columns: 20.5rem minmax(0, 1fr);

          grid-template-rows: minmax(
            0,
            calc(100vh - var(--bar-height) - var(--history-table-height))
          );
        }
      `}</style>
    </main>
  )
}

function Tables({ className }: React.ComponentProps<"div">) {
  return (
    <div className={className}>
      <div className="m-5 flex space-x-5">
        <span>Open Orders (0)</span>
        <span>History (0)</span>
      </div>
      <div className="px-5">
        <span>Empty</span>
      </div>
    </div>
  )
}
