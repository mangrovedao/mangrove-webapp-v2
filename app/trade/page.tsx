"use client"
import MarketSelector from "@/app/trade/_components/market-selector/market-selector"
import { Market } from "./_components/charts/charts"
import { OrderBook } from "./_components/orderbook/orderbook"
import { PricesBar } from "./_components/prices-bar/prices-bar"

export default function Page() {
  return (
    <main className="px-2 gap-x-5">
      {/* <section
        className="flex items-center relative"
        style={{ gridArea: "content" }}
      >
        <MarketSelector />
        <PricesBar />
      </section> */}

      <section
        className="space-y-3 flex flex-col"
        style={{ gridArea: "content" }}
      >
        <div className="col-span-full flex items-center h-10">
          <div>
            <MarketSelector />
          </div>
          <PricesBar />
        </div>
        <div className="col-span-full border border-b-transparent rounded-t-2xl h-full flex flex-col">
          <Market className="" />
        </div>
      </section>

      <section
        className=" bg-red-200 h-full"
        style={{ gridArea: "trade" }}
      ></section>

      {/* <section className="border-x book-and-chart">
        <OrderBook
          className="overflow-hidden border-r book-container"
          style={{ gridArea: "book" }}
        />
      </section>

      <section className="border-x border-t tables-section z-50 bg-background">
        <Tables className="h-1/3" />
      </section> */}
      <section className="border-x border-b rounded-b-2xl tables-section z-50 bg-background">
        <OrderBook className="overflow-hidden" />
      </section>
      <style jsx global>{`
        body {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          overflow: hidden;
        }
      `}</style>
      <style jsx>{`
        main {
          display: grid;
          grid-area: main;
          grid-template-columns: minmax(0, 1fr) 20.5rem;
          grid-template-areas:
            "content trade"
            "tables trade";
          grid-template-rows: 1fr var(--history-table-height);
          height: calc(100vh - 112px);
        }
        .tables-section {
          grid-area: tables;
        }

        .trade-section {
          grid-area: trade;
        }
      `}</style>

      {/* <style jsx>{`
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

        @media (max-height: 800px) {
          main {
            grid-template-rows: 50% 50%;
          }

          .book-and-chart {
            grid-template-rows: calc(50vh - var(--bar-height) + 38px);
          }
        }
      `}</style> */}
      <style global jsx>{`
        .market-chart-container div[role="tabpanel"] {
          height: calc(100% - var(--bar-height) * 2);
        }
        .book-container div[role="tabpanel"] {
          height: calc(100% - var(--bar-height));
        }

        @media (max-height: 800px) {
          :root {
            --history-table-content-height: calc(50vh - var(--bar-height) * 2);
          }
        }
      `}</style>
    </main>
  )
}
