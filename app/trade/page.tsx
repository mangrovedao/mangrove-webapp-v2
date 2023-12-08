"use client"
import MarketSelector from "@/app/trade/market-selector/market-selector"
import { Market } from "./charts/charts"
import { Forms } from "./forms/forms"
import { OrderBook } from "./orderbook/orderbook"
import { PricesBar } from "./prices-bar/prices-bar"
import { Tables } from "./tables/tables"

export default function Page() {
  return (
    <main>
      <section className="trade-section">
        <div className="px-4 border-b h-[var(--bar-height)] flex items-center relative">
          <MarketSelector />
        </div>
        <Forms />
      </section>

      <section className="border-x book-and-chart">
        <OrderBook
          className="overflow-hidden border-r book-container"
          style={{ gridArea: "book" }}
        />
        <div
          className="market-chart-container"
          style={{
            gridArea: "chart",
          }}
        >
          <PricesBar />
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
