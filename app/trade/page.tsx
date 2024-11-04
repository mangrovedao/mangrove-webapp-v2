"use client"
import MarketSelector from "@/app/trade/_components/market-selector/market-selector"
import { Market } from "./_components/charts/charts"
import { Forms } from "./_components/forms/forms"
import { PricesBar } from "./_components/prices-bar/prices-bar"
import { Tables } from "./_components/tables/tables"

export default function Page() {
  return (
    <main className="gap-x-5">
      <div className="flex items-center">
        <MarketSelector />
        <PricesBar />
      </div>
      <section className="chart-container border-x border-t rounded-t-2xl">
        <div
          style={{
            gridArea: "chart",
          }}
        >
          <Market className="w-full h-full" />
        </div>
      </section>

      <section className="border-x border-t border-b rounded-b-2xl tables-section z-50 bg-background">
        <Tables className="h-full" />
      </section>

      <section className="trade-section">
        <Forms />
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
            "nav nav"
            "content trade"
            "tables trade";
          grid-template-rows: 56px 1fr 400px;
          height: calc(100vh - 112px);
          max-height: calc(100vh - 112px);
        }

        .tables-section {
          grid-area: tables;
        }

        .trade-section {
          grid-area: trade;
          max-height: 100%;
        }

        .chart-container {
          display: grid;
          grid-area: content;
          grid-template-areas: "chart";
          grid-template-columns: minmax(0, 1fr);
        }

        {/* @media (max-height: 800px) {
          main {
            grid-template-rows: 56px 50% 50%;
          }

          .chart-container {
            grid-template-rows: calc(50vh - var(--bar-height) + 38px);
          }
        } */}
      `}</style>
      <style global jsx>{`
        {/* .market-chart-container div[role="tabpanel"] {
          height: calc(100% - var(--bar-height) * 2);
        }
        .book-container div[role="tabpanel"] {
          height: calc(100% - var(--bar-height));
        } */}

        {/* @media (max-height: 800px) {
          :root {
            --history-table-content-height: calc(50vh - var(--bar-height) * 2);
          }
        } */}
      `}</style>
    </main>
  )
}
