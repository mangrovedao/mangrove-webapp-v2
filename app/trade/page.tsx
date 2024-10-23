"use client"
import MarketSelector from "@/app/trade/_components/market-selector/market-selector"
import { Market } from "./_components/charts/charts"
import { OrderBook } from "./_components/orderbook/orderbook"
import { PricesBar } from "./_components/prices-bar/prices-bar"

export default function Page() {
  return (
    <main className="-mt-3 px-2 h-[calc(100vh-96px)] overflow-hidden">
      <section className="flex items-center relative">
        <MarketSelector />
        <PricesBar />
      </section>

      <section className="grid grid-cols-4 gap-5 h-full">
        <div className="col-span-3 border rounded-2xl h-full flex flex-col">
          <Market className="h-2/3" />
          <OrderBook className="overflow-hidden" />
        </div>
        <div className="col-span-1 bg-red-200"></div>
      </section>

      {/* <section className="border-x book-and-chart">
        <OrderBook
          className="overflow-hidden border-r book-container"
          style={{ gridArea: "book" }}
        />
      </section>

      <section className="border-x border-t tables-section z-50 bg-background">
        <Tables className="h-1/3" />
      </section> */}
      {/* <style jsx global>{`
        body {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          overflow: hidden;
        }
      `}</style> */}

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
      {/* <style global jsx>{`
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
      `}</style> */}
    </main>
  )
}
