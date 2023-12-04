"use client"
import MarketSelector from "@/components/stateful/market-selector"
import MarketInfoBar from "./components/market-infos-bar"
import Market from "./components/market/market"
import Book from "./components/orderbook/orderbook"
import TradeContainer from "./components/trade-container/trade-container"

export default function Page() {
  return (
    <main>
      <section className="trade-section">
        <div className="px-4 border-b h-[var(--bar-height)] flex items-center">
          <MarketSelector />
        </div>
        <TradeContainer />
      </section>

      <section className="border-x book-and-chart">
        <Book
          className="overflow-hidden border-r book-container"
          style={{ gridArea: "book" }}
        />
        <div
          className="market-chart-container"
          style={{
            gridArea: "chart",
          }}
        >
          <MarketInfoBar />
          <Market className="w-full border-t h-full" />
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

        .book-and-chart {
          display: grid;
          grid-area: content;
          grid-template-areas: "book chart";
          grid-template-columns: 20.5rem minmax(0, 1fr);
          grid-template-rows: var(--book-chart-height);
        }
      `}</style>
      <style global jsx>{`
        .market-chart-container div[role="tabpanel"] {
          height: calc(100% - var(--bar-height) * 2);
        }
        .book-container div[role="tabpanel"] {
          height: calc(100% - var(--bar-height));
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
